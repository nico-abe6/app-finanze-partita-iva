-- 002_preferenze_dashboard.sql
-- Preferenze della pagina Riepilogo: elenco e ordine dei widget scelti dall'utente.
-- Una riga per utente; "widget" è una lista JSON del tipo [{"id": "...", "tipo": "grafico_mensile"}].
-- Da eseguire nel SQL Editor di Supabase dopo 001_schema_iniziale.sql.

create table public.preferenze_dashboard (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  widget jsonb not null default '[]'::jsonb check (jsonb_typeof(widget) = 'array'),
  aggiornato_il timestamptz not null default now()
);

grant select, insert, update, delete on public.preferenze_dashboard to authenticated;

alter table public.preferenze_dashboard enable row level security;

create policy "solo propri dati" on public.preferenze_dashboard for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
