# Finanze – Partita IVA e conti

Web app personale per:

- registrare l'**incassato mese per mese** di una partita IVA in **regime forfettario** e stimare imposta sostitutiva, contributi INPS e netto;
- vedere i **riepiloghi** mese per mese, anno per anno e dall'inizio, con **grafici e tabelle a widget** personalizzabili;
- gestire **conti** (corrente, risparmi, investimenti, contanti) e **movimenti** (entrate, uscite, risparmi, investimenti, trasferimenti) con **etichette** e priorità di spesa **Devo / Ho bisogno / Voglio**.

I dati sono salvati su **Supabase** (database PostgreSQL in UE), quindi sono gli stessi su PC e telefono. L'app è pubblicabile su **GitHub Pages** e installabile sul telefono come app (PWA).

> I calcoli fiscali sono **stime** per accantonare il giusto: non sostituiscono il commercialista. Verifica con lui coefficiente di redditività, aliquota e contributi della tua posizione.

---

## Indice

1. [Requisiti](#requisiti)
2. [Prima configurazione](#prima-configurazione)
3. [Comandi](#comandi)
4. [Come si usa](#come-si-usa)
5. [Come sono fatti i calcoli](#come-sono-fatti-i-calcoli)
6. [Pubblicazione su GitHub Pages](#pubblicazione-su-github-pages)
7. [Installazione sul telefono](#installazione-sul-telefono)
8. [Backup](#backup)
9. [Struttura del progetto](#struttura-del-progetto)
10. [Modificare l'app](#modificare-lapp)

---

## Requisiti

- Node.js 22 (o 20.19 e successive) e npm
- Un progetto Supabase (piano gratuito sufficiente), con regione in UE

## Prima configurazione

1. **Dipendenze**
   ```bash
   npm install
   ```
2. **Database**: nel SQL Editor di Supabase esegui, in ordine, i file in `database/migrations/`:
   - `001_schema_iniziale.sql` – tabelle di fatturato, impostazioni, conti, movimenti
   - `002_preferenze_dashboard.sql` – disposizione dei widget del Riepilogo
   - `003_movimenti_destinazione.sql` – conto di destinazione per risparmi e investimenti
   - `004_segnale_attivita.sql` – funzione usata per evitare la pausa del progetto gratuito (vedi [Backup](#backup))
3. **Utente**: in Supabase, *Authentication → Users → Add user* (email e password, conferma automatica). Poi disattiva le nuove registrazioni (*Allow new users to sign up*).
4. **Collegamento**: copia `.env.example` in `.env.local` e inserisci URL del progetto e **chiave publishable** (*Project Settings → API Keys*). Non usare mai la *secret key* nell'app.

La sicurezza dei dati è garantita dalla **Row Level Security** attiva su tutte le tabelle: la chiave publishable è visibile a chiunque apra il sito, ma senza login non dà accesso a nessun dato.

## Comandi

| Comando | A cosa serve |
|---|---|
| `npm run dev` | avvia l'app in locale su http://localhost:5173 |
| `npm test` | esegue i test e resta in ascolto (premi `q` per uscire) |
| `npx vitest run` | esegue i test una volta |
| `npm run lint` | controlla il codice con ESLint |
| `npx tsc -b` | controlla i tipi TypeScript |
| `npm run build` | crea la versione da pubblicare nella cartella `dist/` |
| `npm run preview` | prova in locale la versione di `dist/` |

## Come si usa

Il menu in basso ha quattro icone.

### Riepilogo (grafico a barre)

- In alto scegli l'**anno**: vale per tutti i widget che lo usano.
- Con la **matita** entri in modalità personalizzazione: frecce per spostare, **X** per togliere, **Aggiungi widget** per aprire il catalogo. La disposizione è salvata online.
- Widget **Partita IVA**: riepilogo dell'anno, composizione mese per mese, andamento progressivo, tabella mese per mese, totale dall'inizio, confronto tra anni, tabella per anno.
- Widget **Conti e spese**: saldi dei conti, entrate e uscite dell'anno (con tasso di risparmio), entrate e uscite mese per mese, spese per priorità, spese per etichetta.

### Fatturato (scontrino)

- Scegli l'anno e tocca un mese: inserisci l'**incassato** (principio di cassa: ciò che hai incassato, non fatturato) e i **contributi INPS versati** nel mese. Vedi subito la stima di imposta, INPS e netto.
- Gli importi si scrivono come `1250,50`, `1.250,50` o `1250.50`.

### Conti (portafoglio)

- **+ Conto** crea un conto: nome, tipo, saldo iniziale (anche negativo) e colore. Tocca una card per modificarla.
- Il pulsante **+** in basso a destra aggiunge un movimento:
  - **Entrata** / **Uscita**: aumenta / diminuisce il saldo del conto. Per le uscite scegli la priorità: **Devo**, **Ho bisogno**, **Voglio**.
  - **Risparmio** / **Investimento**: soldi messi da parte. Diminuiscono il conto di origine e, se indichi un conto di destinazione, aumentano quello.
  - **Trasferimento**: sposta soldi tra due conti; non conta come entrata né come uscita.
  - **Etichette**: scrivi e premi Invio; quelle già usate vengono suggerite.
- I movimenti si vedono per mese e si possono filtrare per conto.

### Impostazioni (cursori)

- **Regime forfettario**: aliquota (5% primi 5 anni / 15%), coefficiente di redditività, modalità di calcolo, aliquota INPS per la stima.
- **Backup**: scarica o importa un file JSON con tutti i dati.
- **Account**: esci.

## Come sono fatti i calcoli

Tutti gli importi sono gestiti in **centesimi** (numeri interi), per evitare errori di arrotondamento.

| Passo | Formula |
|---|---|
| Reddito lordo | incassato × coefficiente di redditività |
| Deduzione | modalità *al netto INPS*: contributi INPS versati; modalità *prudente*: 0 |
| Base imponibile | reddito lordo − deduzione (mai sotto zero) |
| Imposta sostitutiva | base imponibile × aliquota |
| INPS stimato | reddito lordo × aliquota INPS |
| Netto stimato | incassato − imposta − INPS stimato |

- La modalità **prudente** applica l'imposta su tutto il reddito lordo (es. 5% sul 78% dell'incassato) senza togliere i contributi: accantoni un po' di più.
- Le imposte si calcolano **anno per anno**: il valore annuale è quello che fa fede; il totale dall'inizio è la somma dei risultati annuali. I valori mensili sono una ripartizione indicativa.
- Il codice è in `src/domain/calcoloFiscale.ts` e `src/domain/riepilogoPeriodi.ts`, con i test in `src/domain/__tests__/`.

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pubblica.yml` esegue i test, compila e pubblica l'app a ogni push sul ramo `master` (o `main`).

1. Crea su GitHub un repository **pubblico** con un nome senza spazi (es. `finanze-partita-iva`). Con il piano gratuito GitHub Pages funziona solo con repository pubblici: il codice sarà visibile, i dati no (stanno su Supabase e non sono nel repository; `.env.local` è escluso da git).
2. Collega la cartella e invia il codice:
   ```bash
   git remote add origin https://github.com/<tuo-utente>/finanze-partita-iva.git
   git push -u origin master
   ```
3. Su GitHub, *Settings → Secrets and variables → Actions → Variables*, crea due variabili: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (gli stessi valori di `.env.local`).
4. *Settings → Pages → Build and deployment → Source*: scegli **GitHub Actions**.
5. Rilancia il workflow (*Actions → Pubblica su GitHub Pages → Run workflow*) o fai un nuovo push. L'app sarà su `https://<tuo-utente>.github.io/finanze-partita-iva/`.

Il percorso di pubblicazione è passato a Vite con la variabile `BASE_PATH` (in locale vale `/`). Gli indirizzi interni usano `#` (es. `/#/conti`) così funzionano anche ricaricando la pagina.

## Installazione sul telefono

Apri l'indirizzo GitHub Pages dal telefono ed effettua il login, poi:

- **Android (Chrome)**: menu ⋮ → *Installa app* (o *Aggiungi a schermata Home*).
- **iPhone (Safari)**: pulsante Condividi → *Aggiungi alla schermata Home*.

L'app si apre a schermo intero con la propria icona e si aggiorna da sola quando pubblichi una nuova versione. Serve la connessione internet per leggere e salvare i dati.

## Backup

Il piano gratuito di Supabase non fa copie di sicurezza e mette in pausa i progetti senza attività per 7 giorni. La pausa **non cancella i dati**: il progetto si riattiva da *Dashboard → Resume project*, ma solo entro un periodo limitato; dopo, i dati si possono soltanto scaricare come backup e ricaricare in un nuovo progetto.

Per evitare la pausa, il workflow `.github/workflows/mantieni-attivo.yml` chiama ogni 2 giorni la funzione `segnale_attivita` del database (migrazione 004). Usa le stesse variabili del repository del workflow di pubblicazione. Nei repository pubblici GitHub sospende i workflow pianificati dopo 60 giorni senza nuovi commit: in quel caso arriva un'email e basta riattivarlo dalla scheda *Actions*. L'alternativa senza pause è il piano a pagamento di Supabase.

Da *Impostazioni → Backup dei dati*:

- **Scarica backup** salva un file `finanze-backup-AAAA-MM-GG.json` con fatturato, impostazioni, conti, movimenti e widget;
- **Importa backup** rilegge un file: controlla tutti i dati prima di importare, poi crea o aggiorna i record (non cancella quelli già presenti).

## Struttura del progetto

```
├── database/migrations/   script SQL da eseguire su Supabase, in ordine
├── public/                icone e favicon
├── src/
│   ├── config/            valori modificabili: impostazioni predefinite, etichette, colori, catalogo widget, menu
│   ├── types/             tipi TypeScript dei dati
│   ├── domain/            logica pura (calcoli, conversioni, controlli) + test in __tests__/
│   ├── db/                lettura e scrittura su Supabase
│   ├── hooks/             caricamento dati e sessione per i componenti React
│   ├── components/        componenti riutilizzabili (layout, widget, grafici, form)
│   ├── pages/             pagine: Login, Riepilogo, Fatturato, Conti, Impostazioni
│   └── styles/            variabili (palette e misure), regole globali e classi comuni
├── .env.example           modello del file .env.local
└── .github/workflows/     pubblicazione automatica su GitHub Pages
```

Dipendenze principali: React, Vite, TypeScript, react-router (navigazione), @supabase/supabase-js (dati e login), Recharts (grafici), vite-plugin-pwa (installazione come app), Vitest (test).

## Modificare l'app

- **Colori e misure**: `src/styles/variabili.css`. I colori dei grafici sono in `src/config/coloriGrafici.ts` e sono stati scelti per restare distinguibili anche con difficoltà di visione dei colori: se li cambi, evita di mettere vicini azzurro e violetto.
- **Voci del menu**: `src/config/vociMenu.ts`.
- **Nuovo widget**:
  1. aggiungi il tipo in `TIPI_WIDGET` (`src/types/dashboard.ts`);
  2. aggiungi titolo, descrizione, larghezza e gruppo in `src/config/catalogoWidget.ts`;
  3. crea il componente in `src/components/widget/` (riceve `ProprietaWidget`) e registralo in `registroWidget.ts`.
- **Modifiche al database**: crea un nuovo file `database/migrations/00N_descrizione.sql`, eseguilo su Supabase e aggiorna tipi e repository in `src/types/` e `src/db/`.
- Prima di ogni commit: `npx tsc -b`, `npm run lint`, `npx vitest run`.
