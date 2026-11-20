/**
 * Icone.tsx
 * Icone SVG disegnate a mano per il menu (nessuna libreria esterna).
 * Usano "currentColor": prendono il colore del testo dell'elemento che le contiene.
 */

import type { SVGProps } from 'react';

type ProprietaIcona = SVGProps<SVGSVGElement>;

/** Impostazioni comuni a tutte le icone: griglia 24x24, solo contorno, angoli arrotondati */
function BaseIcona({ children, ...altreProprieta }: ProprietaIcona) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...altreProprieta}
    >
      {children}
    </svg>
  );
}

/** Grafico a barre: pagina Riepilogo */
export function IconaRiepilogo(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M4 20h16" />
      <rect x="5.5" y="11" width="3" height="6.5" rx="1" />
      <rect x="10.5" y="5.5" width="3" height="12" rx="1" />
      <rect x="15.5" y="8.5" width="3" height="9" rx="1" />
    </BaseIcona>
  );
}

/** Scontrino: pagina Fatturato */
export function IconaFatturato(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </BaseIcona>
  );
}

/** Portafoglio: pagina Conti */
export function IconaConti(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M7 7V5.5A2.5 2.5 0 0 1 9.5 3H17" />
      <circle cx="16.5" cy="13.5" r="1.2" />
    </BaseIcona>
  );
}

/** Cursori di regolazione: pagina Impostazioni */
export function IconaImpostazioni(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M4 7h9M19 7h1M4 17h3M13 17h7" />
      <circle cx="16" cy="7" r="2.5" />
      <circle cx="10" cy="17" r="2.5" />
    </BaseIcona>
  );
}

/** Più: aggiungi */
export function IconaPiu(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M12 5v14M5 12h14" />
    </BaseIcona>
  );
}

/** Freccia su: sposta prima */
export function IconaSu(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </BaseIcona>
  );
}

/** Freccia giù: sposta dopo */
export function IconaGiu(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </BaseIcona>
  );
}

/** X: chiudi o rimuovi */
export function IconaChiudi(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M6 6l12 12M18 6L6 18" />
    </BaseIcona>
  );
}

/** Matita: modifica */
export function IconaMatita(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </BaseIcona>
  );
}

/** Spunta: fatto */
export function IconaSpunta(proprieta: ProprietaIcona) {
  return (
    <BaseIcona {...proprieta}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </BaseIcona>
  );
}
