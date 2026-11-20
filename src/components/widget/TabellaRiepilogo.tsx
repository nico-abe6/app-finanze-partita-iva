/**
 * TabellaRiepilogo.tsx
 * Tabella con una riga per periodo (mese o anno) e una riga di totale.
 * Colonne: periodo, incassato, imposta, INPS stimato, netto stimato.
 */

import { formattaCentesimiInEuro } from '../../domain/importi';
import type { RiepilogoFiscale } from '../../types/fiscale';
import stili from './Widget.module.css';

export type RigaTabellaRiepilogo = {
  chiave: string;
  etichetta: string;
  riepilogo: RiepilogoFiscale;
  vuota?: boolean; // periodo senza dati: mostrato in grigio
};

type ProprietaTabellaRiepilogo = {
  intestazionePeriodo: string;
  righe: RigaTabellaRiepilogo[];
  totale: { etichetta: string; riepilogo: RiepilogoFiscale };
  nota?: string;
};

function Celle({ riepilogo, vuota }: { riepilogo: RiepilogoFiscale; vuota?: boolean }) {
  const valore = (centesimi: number) => (vuota ? '—' : formattaCentesimiInEuro(centesimi));
  return (
    <>
      <td>{valore(riepilogo.incassatoCentesimi)}</td>
      <td>{valore(riepilogo.impostaSostitutivaCentesimi)}</td>
      <td>{valore(riepilogo.contributiInpsStimatiCentesimi)}</td>
      <td className={stili.colonnaNetto}>{valore(riepilogo.nettoStimatoCentesimi)}</td>
    </>
  );
}

export function TabellaRiepilogo({ intestazionePeriodo, righe, totale, nota }: ProprietaTabellaRiepilogo) {
  return (
    <>
      <div className={stili.contenitoreTabella}>
        <table className={stili.tabella}>
          <thead>
            <tr>
              <th scope="col">{intestazionePeriodo}</th>
              <th scope="col">Incassato</th>
              <th scope="col">Imposta</th>
              <th scope="col">INPS stimato</th>
              <th scope="col">Netto stimato</th>
            </tr>
          </thead>
          <tbody>
            {righe.map((riga) => (
              <tr key={riga.chiave} className={riga.vuota ? stili.rigaVuota : undefined}>
                <th scope="row">{riga.etichetta}</th>
                <Celle riepilogo={riga.riepilogo} vuota={riga.vuota} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>{totale.etichetta}</td>
              <Celle riepilogo={totale.riepilogo} />
            </tr>
          </tfoot>
        </table>
      </div>
      {nota && <p className={stili.notaTabella}>{nota}</p>}
    </>
  );
}
