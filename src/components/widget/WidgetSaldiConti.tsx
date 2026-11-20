/**
 * WidgetSaldiConti.tsx
 * Widget: saldo attuale di ogni conto e patrimonio totale.
 */

import { ETICHETTE_CONTO } from '../../config/etichetteTipoConto';
import { coloreDelConto } from '../../domain/coloriConto';
import { formattaCentesimiInEuro } from '../../domain/importi';
import { calcolaSaldiConti } from '../../domain/movimenti';
import { MessaggioNessunDato } from './MessaggioNessunDato';
import { RiquadroPrincipale } from './RiquadroPrincipale';
import stili from './Widget.module.css';
import type { ProprietaWidget } from './tipiWidget';

export function WidgetSaldiConti({ conti, movimenti }: ProprietaWidget) {
  if (conti.length === 0) return <MessaggioNessunDato destinazione="contiVuoti" />;

  const saldi = calcolaSaldiConti(conti, movimenti);
  const totale = [...saldi.values()].reduce((somma, saldo) => somma + saldo, 0);

  return (
    <>
      <RiquadroPrincipale etichetta="Patrimonio totale" valoreCentesimi={totale} />
      <ul className={stili.conti}>
        {conti.map((conto) => {
          const saldo = saldi.get(conto.id ?? '') ?? 0;
          return (
            <li key={conto.id} className={stili.conto}>
              <span
                className={stili.contoPallino}
                style={{ backgroundColor: `var(--scuro-${coloreDelConto(conto)})` }}
                aria-hidden="true"
              />
              <span className={stili.contoNome}>
                {conto.nomeConto}
                <span className={stili.contoTipo}>{ETICHETTE_CONTO[conto.tipoConto]}</span>
              </span>
              <span className={`${stili.contoSaldo} ${saldo < 0 ? stili.negativo : ''}`}>
                {formattaCentesimiInEuro(saldo)}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
