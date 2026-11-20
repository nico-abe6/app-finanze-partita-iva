/**
 * main.tsx
 * Punto di ingresso: carica gli stili globali e monta l'app nella pagina.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variabili.css';
import './styles/base.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
