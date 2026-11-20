/**
 * App.tsx
 * Componente principale: decide cosa mostrare.
 * - mentre controlla il login: un messaggio di caricamento
 * - se non hai fatto login: la pagina di login
 * - se hai fatto login: il menu e le pagine, gestite dal router
 */

import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { useSessione } from './hooks/useSessione';
import { Layout } from './components/Layout/Layout';
import { PaginaLogin } from './pages/Login/PaginaLogin';
import { PaginaRiepilogo } from './pages/Riepilogo/PaginaRiepilogo';
import { PaginaFatturato } from './pages/Fatturato/PaginaFatturato';
import { PaginaConti } from './pages/Conti/PaginaConti';
import { PaginaImpostazioni } from './pages/Impostazioni/PaginaImpostazioni';

function App() {
  const { sessione, caricamento } = useSessione();

  if (caricamento) {
    return <p className="messaggio-caricamento">Caricamento…</p>;
  }

  if (!sessione) {
    return <PaginaLogin />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PaginaRiepilogo />} />
          <Route path="fatturato" element={<PaginaFatturato />} />
          <Route path="conti" element={<PaginaConti />} />
          <Route path="impostazioni" element={<PaginaImpostazioni />} />
          {/* qualsiasi indirizzo sconosciuto riporta al riepilogo */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
