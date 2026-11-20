/**
 * WidgetRiepilogoAnno.tsx
 * Widget: totali dell'anno scelto (calcolo annuale, quello che fa fede).
 */

import { calcolaRiepilogoAnno, filtraPerAnno } from '../../domain/riepilogoPeriodi';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import { RiquadriRiepilogo } from './RiquadriRiepilogo';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetRiepilogoAnno({ righe, impostazioni, anno }: ProprietaWidget) {
  if (filtraPerAnno(righe, anno).length === 0) return <MessaggioNessunDato periodo={`nel ${anno}`} />;
  return <RiquadriRiepilogo riepilogo={calcolaRiepilogoAnno(righe, impostazioni, anno)} largo />;
}
