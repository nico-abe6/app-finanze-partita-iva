/**
 * RiquadroPrincipale.tsx
 * Il numero più importante di un widget, in grande su sfondo sfumato.
 */

import { formattaCentesimiInEuro } from '../../domain/importi';
import stili from './Widget.module.css';

export function RiquadroPrincipale({ etichetta, valoreCentesimi }: { etichetta: string; valoreCentesimi: number }) {
  return (
    <div className={`${stili.riquadroPrincipale} ${stili.riquadroPrincipaleSolo}`}>
      <p className={stili.riquadroEtichetta}>{etichetta}</p>
      <p className={stili.riquadroValore}>{formattaCentesimiInEuro(valoreCentesimi)}</p>
    </div>
  );
}
