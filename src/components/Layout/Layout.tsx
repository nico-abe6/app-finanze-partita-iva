/**
 * Layout.tsx
 * Struttura comune a tutte le pagine dopo il login:
 * lo spazio dove compare la pagina attiva (<Outlet />) e il menu a icone in basso.
 * Il menu resta in basso su tutti gli schermi (telefono e PC).
 */

import { NavLink, Outlet } from 'react-router';
import { VOCI_MENU } from '../../config/vociMenu';
import stili from './Layout.module.css';

export function Layout() {
  return (
    <div className={stili.layout}>
      <main className={stili.contenuto}>
        <Outlet />
      </main>

      <nav className={stili.menu} aria-label="Menu principale">
        {VOCI_MENU.map((voce) => {
          const Icona = voce.icona;
          return (
            <NavLink
              key={voce.percorso}
              to={voce.percorso}
              end={voce.percorso === '/'}
              title={voce.etichetta}
              data-colore={voce.colore}
              className={({ isActive }) =>
                isActive ? `${stili.voce} ${stili.voceAttiva}` : stili.voce
              }
            >
              <span className={stili.bollaIcona}>
                <Icona className={stili.icona} />
              </span>
              <span className="solo-lettori-schermo">{voce.etichetta}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
