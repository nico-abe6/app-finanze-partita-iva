/**
 * PaginaRiepilogo.tsx
 * Pagina principale personalizzabile: in cima la scelta dell'anno,
 * sotto i widget (grafici, tabelle, totali) scelti dall'utente.
 * Con "Personalizza" si aggiungono, spostano e tolgono i widget; la disposizione
 * è salvata su Supabase ed è la stessa su telefono e PC.
 */

import { useState } from 'react';
import { ContenitoreWidget } from '../../components/Widget/ContenitoreWidget';
import { FoglioModale } from '../../components/FoglioModale/FoglioModale';
import { IconaMatita, IconaPiu, IconaSpunta } from '../../components/Icone/Icone';
import { SelettoreAnno } from '../../components/SelettoreAnno/SelettoreAnno';
import { REGISTRO_WIDGET } from '../../components/widget/registroWidget';
import { CATALOGO_WIDGET } from '../../config/catalogoWidget';
import { annoIniziale, anniSelezionabili } from '../../domain/anni';
import { aggiungiWidget, rimuoviWidget, spostaWidget } from '../../domain/dashboard';
import { elencaAnniConDati } from '../../domain/riepilogoPeriodi';
import { useDatiFiscali } from '../../hooks/useDatiFiscali';
import { generaIdWidget, useWidgetDashboard } from '../../hooks/useWidgetDashboard';
import { TIPI_WIDGET, type TipoWidget } from '../../types/dashboard';
import stili from './PaginaRiepilogo.module.css';

export function PaginaRiepilogo() {
  const { stato } = useDatiFiscali();
  const { widget, avviso, modificaWidget } = useWidgetDashboard();
  const [annoCorrente] = useState(() => new Date().getFullYear());
  const [annoScelto, setAnnoScelto] = useState<number | null>(null);
  const [inModifica, setInModifica] = useState(false);
  const [catalogoAperto, setCatalogoAperto] = useState(false);

  if (stato.fase === 'errore') {
    return <p className="messaggio messaggio--errore">Impossibile caricare i dati: {stato.messaggio}</p>;
  }
  if (stato.fase === 'caricamento' || widget === null) {
    return <p className="messaggio-caricamento">Caricamento…</p>;
  }

  const anniConDati = elencaAnniConDati(stato.righe);
  const anno = annoScelto ?? annoIniziale(anniConDati, annoCorrente);
  const tipiPresenti = new Set(widget.map((voce) => voce.tipo));

  function aggiungi(tipo: TipoWidget) {
    modificaWidget((lista) => aggiungiWidget(lista, tipo, generaIdWidget));
    setCatalogoAperto(false);
  }

  return (
    <>
      <header className="intestazione-pagina">
        <h1>Riepilogo</h1>
        <div className="intestazione-pagina__azioni">
          <SelettoreAnno
            anno={anno}
            anniDisponibili={anniSelezionabili(anniConDati, annoCorrente)}
            onCambia={setAnnoScelto}
          />
          <button
            type="button"
            className={`bottone bottone--icona ${inModifica ? 'bottone--primario' : ''}`}
            onClick={() => setInModifica(!inModifica)}
            aria-pressed={inModifica}
            aria-label={inModifica ? 'Fine personalizzazione' : 'Personalizza i widget'}
            title={inModifica ? 'Fine' : 'Personalizza'}
          >
            {inModifica ? <IconaSpunta /> : <IconaMatita />}
          </button>
        </div>
      </header>

      {avviso && <p className={`messaggio messaggio--avviso ${stili.avviso}`}>{avviso}</p>}

      <div className={stili.griglia}>
        {widget.map((voce, posizione) => {
          const catalogo = CATALOGO_WIDGET[voce.tipo];
          const ComponenteWidget = REGISTRO_WIDGET[voce.tipo];
          return (
            <ContenitoreWidget
              key={voce.id}
              titolo={catalogo.titolo}
              sottotitolo={catalogo.usaAnnoScelto ? String(anno) : 'Tutti gli anni'}
              larghezza={catalogo.larghezza}
              inModifica={inModifica}
              primo={posizione === 0}
              ultimo={posizione === widget.length - 1}
              onSposta={(direzione) => modificaWidget((lista) => spostaWidget(lista, voce.id, direzione))}
              onRimuovi={() => modificaWidget((lista) => rimuoviWidget(lista, voce.id))}
            >
              <ComponenteWidget righe={stato.righe} impostazioni={stato.impostazioni} anno={anno} />
            </ContenitoreWidget>
          );
        })}

        {(inModifica || widget.length === 0) && (
          <button type="button" className={stili.aggiungi} onClick={() => setCatalogoAperto(true)}>
            <IconaPiu />
            Aggiungi widget
          </button>
        )}
      </div>

      <FoglioModale aperto={catalogoAperto} titolo="Aggiungi un widget" onChiudi={() => setCatalogoAperto(false)}>
        <ul className={stili.catalogo}>
          {TIPI_WIDGET.map((tipo) => {
            const presente = tipiPresenti.has(tipo);
            return (
              <li key={tipo}>
                <button type="button" className={stili.voceCatalogo} onClick={() => aggiungi(tipo)} disabled={presente}>
                  <span className={stili.voceCatalogoTitolo}>{CATALOGO_WIDGET[tipo].titolo}</span>
                  <span className={stili.voceCatalogoDescrizione}>
                    {presente ? 'Già nella pagina' : CATALOGO_WIDGET[tipo].descrizione}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </FoglioModale>
    </>
  );
}
