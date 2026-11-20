/**
 * MessaggioNessunDato.tsx
 * Testo mostrato da un widget quando non ci sono dati da visualizzare,
 * con il collegamento alla pagina dove inserirli.
 */

import { Link } from 'react-router';
import stili from './Widget.module.css';

const DESTINAZIONI = {
  fatturato: { percorso: '/fatturato', testo: 'Inseriscilo dalla pagina Fatturato', cosa: 'Nessun fatturato registrato' },
  conti: { percorso: '/conti', testo: 'Aggiungili dalla pagina Conti', cosa: 'Nessun movimento registrato' },
  contiVuoti: { percorso: '/conti', testo: 'Crea il primo dalla pagina Conti', cosa: 'Nessun conto' },
} as const;

type ProprietaMessaggioNessunDato = {
  periodo?: string;
  destinazione?: keyof typeof DESTINAZIONI;
};

export function MessaggioNessunDato({ periodo, destinazione = 'fatturato' }: ProprietaMessaggioNessunDato) {
  const voce = DESTINAZIONI[destinazione];
  return (
    <p className={stili.vuoto}>
      {voce.cosa}
      {periodo ? ` ${periodo}` : ''}. <Link to={voce.percorso}>{voce.testo}</Link>.
    </p>
  );
}
