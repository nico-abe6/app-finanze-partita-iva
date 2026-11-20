-- 001_schema_iniziale.sql
-- Schema iniziale: fatturato mensile, impostazioni fiscali, conti, movimenti.
-- Importi in centesimi (bigint). Ogni riga appartiene a un utente (user_id)
-- e la Row Level Security fa vedere a ciascun utente solo i propri dati.

-- Fatturato: una riga per mese per utente
create table public.fatturato_mensile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  anno smallint not null check (anno between 2000 and 2100),
  mese smallint not null check (mese between 1 and 12),
  incassato_centesimi bigint not null default 0 check (incassato_centesimi >= 0),
  contributi_inps_versati_centesimi bigint not null default 0 check (contributi_inps_versati_centesimi >= 0),
  note text,
  unique (user_id, anno, mese)
);

-- Impostazioni fiscali: una sola riga per utente
create table public.impostazioni_fiscali (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  aliquota_imposta_sostitutiva numeric(5,4) not null check (aliquota_imposta_sostitutiva between 0 and 1),
  coefficiente_redditivita numeric(5,4) not null check (coefficiente_redditivita between 0 and 1),
  modalita_calcolo text not null check (modalita_calcolo in ('netto_inps', 'prudente')),
  aliquota_contributi_inps numeric(5,4) not null check (aliquota_contributi_inps between 0 and 1)
);

-- Conti
create table public.conti (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome_conto text not null,
  tipo_conto text not null check (tipo_conto in ('corrente', 'risparmio', 'investimento', 'contanti')),
  saldo_iniziale_centesimi bigint not null default 0,
  colore text
);

-- Movimenti
create table public.movimenti (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  conto_id uuid not null references public.conti(id) on delete restrict,
  conto_destinazione_id uuid references public.conti(id) on delete restrict,
  tipo text not null check (tipo in ('entrata', 'uscita', 'risparmio', 'investimento', 'trasferimento')),
  data date not null,
  importo_centesimi bigint not null check (importo_centesimi > 0),
  etichette text[] not null default '{}',
  priorita text check (priorita in ('devo', 'ho_bisogno', 'voglio')),
  descrizione text,
  -- il conto di destinazione c'è se e solo se è un trasferimento
  check ((tipo = 'trasferimento') = (conto_destinazione_id is not null)),
  -- la priorità ha senso solo per le uscite
  check (priorita is null or tipo = 'uscita')
);

create index on public.movimenti (user_id, data);
create index on public.movimenti (conto_id);
create index on public.movimenti using gin (etichette);

-- Permessi per gli utenti autenticati
grant select, insert, update, delete on
  public.fatturato_mensile, public.impostazioni_fiscali, public.conti, public.movimenti
  to authenticated;

-- Row Level Security: ogni utente vede e modifica solo le proprie righe
alter table public.fatturato_mensile enable row level security;
alter table public.impostazioni_fiscali enable row level security;
alter table public.conti enable row level security;
alter table public.movimenti enable row level security;

create policy "solo propri dati" on public.fatturato_mensile for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "solo propri dati" on public.impostazioni_fiscali for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "solo propri dati" on public.conti for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "solo propri dati" on public.movimenti for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);