/**
 * PaginaConti.tsx
 * Conti e movimenti: in cima il patrimonio e le card dei conti con il saldo,
 * sotto i movimenti del mese scelto (filtrabili per conto) raggruppati per giorno.
 * Il pulsante "+" in basso aggiunge un movimento.
 */

import { useState } from 'react';
import { FoglioModale } from '../../components/FoglioModale/FoglioModale';
import { IconaPiu } from '../../components/Icone/Icone';
import { SelettoreMese } from '../../components/SelettoreMese/SelettoreMese';
import { ETICHETTE_PRIORITA } from '../../config/etichettePriorita';
import { ETICHETTE_CONTO } from '../../config/etichetteTipoConto';
import { ETICHETTE_MOVIMENTO } from '../../config/etichetteTipoMovimento';
import { coloreDelConto } from '../../domain/coloriConto';
import { formattaDataLeggibile } from '../../domain/date';
import { formattaCentesimiInEuro } from '../../domain/importi';
import {
  calcolaRiepilogoFlussi,
  calcolaSaldiConti,
  elencaEtichette,
  filtraMovimentiPerPeriodo,
  ordinaMovimentiPerDataDecrescente,
} from '../../domain/movimenti';
import { useDatiFinanze } from '../../hooks/useDatiFinanze';
import type { Conto, Movimento } from '../../types/finanze';
import { ModuloConto } from './ModuloConto';
import { ModuloMovimento } from './ModuloMovimento';
import stili from './PaginaConti.module.css';

type FinestraAperta =
  | { tipo: 'nessuna' }
  | { tipo: 'conto'; conto?: Conto }
  | { tipo: 'movimento'; movimento?: Movimento };

const SEGNO_PER_TIPO: Record<Movimento['tipo'], string> = {
  entrata: '+',
  uscita: '−',
  risparmio: '→',
  investimento: '→',
  trasferimento: '⇄',
};

/** Titolo di una riga: descrizione, altrimenti prima etichetta, altrimenti il tipo */
function titoloMovimento(movimento: Movimento): string {
  return movimento.descrizione || movimento.etichette[0] || ETICHETTE_MOVIMENTO[movimento.tipo];
}

export function PaginaConti() {
  const { stato, ricarica } = useDatiFinanze();
  const [oggi] = useState(() => new Date());
  const [periodo, setPeriodo] = useState(() => ({ anno: oggi.getFullYear(), mese: oggi.getMonth() + 1 }));
  const [filtroConto, setFiltroConto] = useState('');
  const [finestra, setFinestra] = useState<FinestraAperta>({ tipo: 'nessuna' });

  if (stato.fase === 'errore') {
    return <p className="messaggio messaggio--errore">Impossibile caricare i dati: {stato.messaggio}</p>;
  }
  if (stato.fase === 'caricamento') {
    return <p className="messaggio-caricamento">Caricamento…</p>;
  }

  const { conti, movimenti } = stato;
  const nomiConti = new Map(conti.map((conto) => [conto.id, conto.nomeConto]));
  const saldi = calcolaSaldiConti(conti, movimenti);
  const patrimonio = [...saldi.values()].reduce((somma, saldo) => somma + saldo, 0);

  const movimentiMese = filtraMovimentiPerPeriodo(movimenti, periodo.anno, periodo.mese).filter(
    (movimento) => !filtroConto || movimento.contoId === filtroConto || movimento.contoDestinazioneId === filtroConto
  );
  const flussiMese = calcolaRiepilogoFlussi(movimentiMese);

  // Raggruppa i movimenti per giorno, dal più recente
  const perGiorno = new Map<string, Movimento[]>();
  for (const movimento of ordinaMovimentiPerDataDecrescente(movimentiMese)) {
    perGiorno.set(movimento.data, [...(perGiorno.get(movimento.data) ?? []), movimento]);
  }

  function chiudiERicarica() {
    setFinestra({ tipo: 'nessuna' });
    ricarica();
  }

  const titoloFinestra =
    finestra.tipo === 'conto'
      ? finestra.conto ? 'Modifica conto' : 'Nuovo conto'
      : finestra.tipo === 'movimento'
        ? finestra.movimento ? 'Modifica movimento' : 'Nuovo movimento'
        : '';

  return (
    <>
      <header className="intestazione-pagina">
        <h1>Conti</h1>
        <button type="button" className="bottone" onClick={() => setFinestra({ tipo: 'conto' })}>
          <IconaPiu /> Conto
        </button>
      </header>

      <section className={stili.patrimonio} aria-label="Patrimonio">
        <p className={stili.patrimonioEtichetta}>Patrimonio totale</p>
        <p className={stili.patrimonioValore}>{formattaCentesimiInEuro(patrimonio)}</p>
      </section>

      {conti.length === 0 ? (
        <p className="messaggio">
          Crea il tuo primo conto (ad esempio il conto corrente o i contanti) per iniziare a registrare entrate e uscite.
        </p>
      ) : (
        <ul className={stili.schedeConti}>
          {conti.map((conto) => {
            const colore = coloreDelConto(conto);
            const saldo = saldi.get(conto.id ?? '') ?? 0;
            return (
              <li key={conto.id}>
                <button
                  type="button"
                  className={stili.schedaConto}
                  style={{ backgroundColor: `var(--pastello-${colore})` }}
                  onClick={() => setFinestra({ tipo: 'conto', conto })}
                  aria-label={`${conto.nomeConto}, saldo ${formattaCentesimiInEuro(saldo)}. Modifica`}
                >
                  <span className={stili.schedaTipo} style={{ color: `var(--scuro-${colore})` }}>
                    {ETICHETTE_CONTO[conto.tipoConto]}
                  </span>
                  <span className={stili.schedaNome}>{conto.nomeConto}</span>
                  <span className={stili.schedaSaldo}>{formattaCentesimiInEuro(saldo)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <section className={stili.sezioneMovimenti} aria-label="Movimenti">
        <div className={stili.barraMovimenti}>
          <h2 className={stili.titoloSezione}>Movimenti</h2>
          <div className={stili.filtri}>
            <SelettoreMese anno={periodo.anno} mese={periodo.mese} onCambia={(anno, mese) => setPeriodo({ anno, mese })} />
            {conti.length > 1 && (
              <select
                className={stili.filtroConto}
                value={filtroConto}
                onChange={(evento) => setFiltroConto(evento.target.value)}
                aria-label="Filtra per conto"
              >
                <option value="">Tutti i conti</option>
                {conti.map((conto) => (
                  <option key={conto.id} value={conto.id}>
                    {conto.nomeConto}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <dl className={stili.flussiMese}>
          <div>
            <dt>Entrate</dt>
            <dd>{formattaCentesimiInEuro(flussiMese.entrateCentesimi)}</dd>
          </div>
          <div>
            <dt>Uscite</dt>
            <dd>{formattaCentesimiInEuro(flussiMese.usciteCentesimi)}</dd>
          </div>
          <div>
            <dt>Messo da parte</dt>
            <dd>{formattaCentesimiInEuro(flussiMese.risparmiatoCentesimi + flussiMese.investitoCentesimi)}</dd>
          </div>
        </dl>

        {perGiorno.size === 0 ? (
          <p className={stili.vuoto}>Nessun movimento in questo mese.</p>
        ) : (
          [...perGiorno.entries()].map(([giorno, movimentiGiorno]) => (
            <div key={giorno} className={stili.giorno}>
              <h3 className={stili.titoloGiorno}>{formattaDataLeggibile(giorno)}</h3>
              <ul className={stili.elencoMovimenti}>
                {movimentiGiorno.map((movimento) => (
                  <li key={movimento.id}>
                    <button
                      type="button"
                      className={stili.movimento}
                      data-tipo={movimento.tipo}
                      onClick={() => setFinestra({ tipo: 'movimento', movimento })}
                    >
                      <span className={stili.movimentoSimbolo} aria-hidden="true">
                        {SEGNO_PER_TIPO[movimento.tipo]}
                      </span>
                      <span className={stili.movimentoTesti}>
                        <span className={stili.movimentoTitolo}>{titoloMovimento(movimento)}</span>
                        <span className={stili.movimentoDettagli}>
                          {ETICHETTE_MOVIMENTO[movimento.tipo]} · {nomiConti.get(movimento.contoId) ?? 'conto eliminato'}
                          {movimento.contoDestinazioneId && ` → ${nomiConti.get(movimento.contoDestinazioneId) ?? '?'}`}
                        </span>
                        {(movimento.priorita || movimento.etichette.length > 0) && (
                          <span className={stili.movimentoEtichette}>
                            {movimento.priorita && (
                              <span className={stili.badgePriorita} data-priorita={movimento.priorita}>
                                {ETICHETTE_PRIORITA[movimento.priorita]}
                              </span>
                            )}
                            {movimento.etichette.map((etichetta) => (
                              <span key={etichetta} className={stili.badgeEtichetta}>
                                {etichetta}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <span className={stili.movimentoImporto}>
                        {movimento.tipo === 'entrata' ? '+' : movimento.tipo === 'uscita' ? '−' : ''}
                        {formattaCentesimiInEuro(movimento.importoCentesimi)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <button
        type="button"
        className={stili.pulsanteAggiungi}
        onClick={() => setFinestra(conti.length === 0 ? { tipo: 'conto' } : { tipo: 'movimento' })}
        aria-label={conti.length === 0 ? 'Nuovo conto' : 'Nuovo movimento'}
      >
        <IconaPiu />
      </button>

      <FoglioModale aperto={finestra.tipo !== 'nessuna'} titolo={titoloFinestra} onChiudi={() => setFinestra({ tipo: 'nessuna' })}>
        {finestra.tipo === 'conto' && (
          <ModuloConto
            key={finestra.conto?.id ?? 'nuovo'}
            contoEsistente={finestra.conto}
            onFatto={chiudiERicarica}
            onAnnulla={() => setFinestra({ tipo: 'nessuna' })}
          />
        )}
        {finestra.tipo === 'movimento' && (
          <ModuloMovimento
            key={finestra.movimento?.id ?? 'nuovo'}
            conti={conti}
            suggerimentiEtichette={elencaEtichette(movimenti)}
            movimentoEsistente={finestra.movimento}
            contoPredefinitoId={filtroConto || undefined}
            onFatto={chiudiERicarica}
            onAnnulla={() => setFinestra({ tipo: 'nessuna' })}
          />
        )}
      </FoglioModale>
    </>
  );
}
