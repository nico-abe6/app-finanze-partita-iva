/**
 * PaginaFatturato.tsx
 * Inserimento del fatturato mese per mese: si sceglie l'anno, si tocca un mese
 * e si compilano incassato e contributi INPS versati. In cima i totali dell'anno.
 */

import { useState } from 'react';
import { FoglioModale } from '../../components/FoglioModale/FoglioModale';
import { SelettoreAnno } from '../../components/SelettoreAnno/SelettoreAnno';
import { annoIniziale, anniSelezionabili } from '../../domain/anni';
import { formattaCentesimiInEuro } from '../../domain/importi';
import { nomeMese } from '../../domain/mesi';
import { calcolaRiepilogoAnno, elencaAnniConDati, filtraPerAnno } from '../../domain/riepilogoPeriodi';
import { useDatiFiscali } from '../../hooks/useDatiFiscali';
import { ModuloMese } from './ModuloMese';
import stili from './PaginaFatturato.module.css';

const MESI = Array.from({ length: 12 }, (_valore, indice) => indice + 1);
const ANNI_PRIMA_SELEZIONABILI = 3;
const ANNI_DOPO_SELEZIONABILI = 1;

export function PaginaFatturato() {
  const { stato, ricarica } = useDatiFiscali();
  const [oggi] = useState(() => new Date());
  const [annoScelto, setAnnoScelto] = useState<number | null>(null);
  const [meseAperto, setMeseAperto] = useState<number | null>(null);

  if (stato.fase === 'errore') {
    return <p className="messaggio messaggio--errore">Impossibile caricare i dati: {stato.messaggio}</p>;
  }
  if (stato.fase === 'caricamento') {
    return <p className="messaggio-caricamento">Caricamento…</p>;
  }

  const annoCorrente = oggi.getFullYear();
  const meseCorrente = oggi.getMonth() + 1;
  const anniConDati = elencaAnniConDati(stato.righe);
  const anno = annoScelto ?? annoIniziale(anniConDati, annoCorrente);
  const righeAnno = filtraPerAnno(stato.righe, anno);
  const totaleAnno = calcolaRiepilogoAnno(stato.righe, stato.impostazioni, anno);
  const rigaAperta = righeAnno.find((riga) => riga.mese === meseAperto);

  return (
    <>
      <header className="intestazione-pagina">
        <h1>Fatturato</h1>
        <SelettoreAnno
          anno={anno}
          anniDisponibili={anniSelezionabili(anniConDati, annoCorrente, ANNI_PRIMA_SELEZIONABILI, ANNI_DOPO_SELEZIONABILI)}
          onCambia={setAnnoScelto}
        />
      </header>

      <section className={stili.totali} aria-label={`Totali ${anno}`}>
        <div>
          <p className={stili.totaleEtichetta}>Incassato {anno}</p>
          <p className={stili.totaleValore}>{formattaCentesimiInEuro(totaleAnno.incassatoCentesimi)}</p>
        </div>
        <div>
          <p className={stili.totaleEtichetta}>Netto stimato</p>
          <p className={stili.totaleValore}>{formattaCentesimiInEuro(totaleAnno.nettoStimatoCentesimi)}</p>
        </div>
      </section>

      <ul className={stili.elencoMesi}>
        {MESI.map((mese) => {
          const riga = righeAnno.find((voce) => voce.mese === mese);
          const futuro = anno > annoCorrente || (anno === annoCorrente && mese > meseCorrente);
          return (
            <li key={mese}>
              <button
                type="button"
                className={`${stili.mese} ${riga ? stili.meseCompilato : ''} ${futuro ? stili.meseFuturo : ''}`}
                onClick={() => setMeseAperto(mese)}
              >
                <span className={stili.meseNome}>{nomeMese(mese)}</span>
                <span className={stili.meseValori}>
                  {riga ? (
                    <>
                      <span className={stili.meseIncassato}>{formattaCentesimiInEuro(riga.incassatoCentesimi)}</span>
                      {riga.contributiInpsVersatiCentesimi > 0 && (
                        <span className={stili.meseDettaglio}>
                          INPS versato {formattaCentesimiInEuro(riga.contributiInpsVersatiCentesimi)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={stili.meseDettaglio}>Da inserire</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <FoglioModale
        aperto={meseAperto !== null}
        titolo={meseAperto !== null ? `${nomeMese(meseAperto)} ${anno}` : ''}
        onChiudi={() => setMeseAperto(null)}
      >
        {meseAperto !== null && (
          <ModuloMese
            key={`${anno}-${meseAperto}`}
            anno={anno}
            mese={meseAperto}
            rigaEsistente={rigaAperta}
            impostazioni={stato.impostazioni}
            onAnnulla={() => setMeseAperto(null)}
            onFatto={() => {
              setMeseAperto(null);
              ricarica();
            }}
          />
        )}
      </FoglioModale>
    </>
  );
}
