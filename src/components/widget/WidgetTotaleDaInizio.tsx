/**
 * WidgetTotaleDaInizio.tsx
 * Widget: totali da quando hai iniziato a inserire dati (somma dei calcoli annuali).
 */

import { calcolaRiepilogoTotale } from '../../domain/riepilogoPeriodi';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import { RiquadriRiepilogo } from './RiquadriRiepilogo';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetTotaleDaInizio({ righe, impostazioni }: ProprietaWidget) {
  if (righe.length === 0) return <MessaggioNessunDato periodo="finora" />;
  return <RiquadriRiepilogo riepilogo={calcolaRiepilogoTotale(righe, impostazioni)} largo={false} />;
}
