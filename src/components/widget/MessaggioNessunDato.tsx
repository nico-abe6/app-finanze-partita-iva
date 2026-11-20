/**
 * MessaggioNessunDato.tsx
 * Testo mostrato da un widget quando non ci sono dati da visualizzare.
 */

import { Link } from 'react-router';
import stili from './Widget.module.css';

export function MessaggioNessunDato({ periodo }: { periodo: string }) {
  return (
    <p className={stili.vuoto}>
      Nessun incasso registrato {periodo}. <Link to="/fatturato">Inseriscilo dalla pagina Fatturato</Link>.
    </p>
  );
}
