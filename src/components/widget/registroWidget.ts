/**
 * registroWidget.ts
 * Collega ogni tipo di widget al componente React che lo disegna.
 */

import type { ComponentType } from 'react';
import type { TipoWidget } from '../../types/dashboard';
import type { ProprietaWidget } from './tipiWidget';
import { WidgetAndamentoCumulato } from './WidgetAndamentoCumulato';
import { WidgetGraficoAnnuale } from './WidgetGraficoAnnuale';
import { WidgetGraficoMensile } from './WidgetGraficoMensile';
import { WidgetRiepilogoAnno } from './WidgetRiepilogoAnno';
import { WidgetTabellaAnnuale } from './WidgetTabellaAnnuale';
import { WidgetTabellaMensile } from './WidgetTabellaMensile';
import { WidgetTotaleDaInizio } from './WidgetTotaleDaInizio';

export const REGISTRO_WIDGET: Record<TipoWidget, ComponentType<ProprietaWidget>> = {
  riepilogo_anno: WidgetRiepilogoAnno,
  grafico_mensile: WidgetGraficoMensile,
  andamento_cumulato: WidgetAndamentoCumulato,
  tabella_mensile: WidgetTabellaMensile,
  totale_da_inizio: WidgetTotaleDaInizio,
  grafico_annuale: WidgetGraficoAnnuale,
  tabella_annuale: WidgetTabellaAnnuale,
};
