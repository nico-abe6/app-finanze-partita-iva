/**
 * vociMenu.ts
 * Elenco delle voci del menu in basso: percorso, etichetta (letta dai lettori
 * di schermo e mostrata come suggerimento), icona e colore pastello della voce attiva.
 * Per aggiungere, togliere o riordinare una voce si modifica solo questo file.
 */

import type { ComponentType, SVGProps } from 'react';
import {
  IconaConti,
  IconaFatturato,
  IconaImpostazioni,
  IconaRiepilogo,
} from '../components/Icone/Icone';

/** Colori disponibili: corrispondono a --pastello-* e --scuro-* in variabili.css */
export type ColoreVoceMenu = 'verde' | 'azzurro' | 'violetto' | 'acqua';

export type VoceMenu = {
  percorso: string;
  etichetta: string;
  icona: ComponentType<SVGProps<SVGSVGElement>>;
  colore: ColoreVoceMenu;
};

export const VOCI_MENU: VoceMenu[] = [
  { percorso: '/', etichetta: 'Riepilogo', icona: IconaRiepilogo, colore: 'violetto' },
  { percorso: '/fatturato', etichetta: 'Fatturato', icona: IconaFatturato, colore: 'verde' },
  { percorso: '/conti', etichetta: 'Conti', icona: IconaConti, colore: 'azzurro' },
  { percorso: '/impostazioni', etichetta: 'Impostazioni', icona: IconaImpostazioni, colore: 'acqua' },
];
