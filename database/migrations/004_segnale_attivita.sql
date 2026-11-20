-- 004_segnale_attivita.sql
-- Funzione minima chiamata periodicamente dal workflow "mantieni-attivo.yml"
-- per generare attività sul database ed evitare la pausa automatica dei progetti
-- gratuiti di Supabase dopo 7 giorni senza utilizzo.
-- Non legge né scrive dati dell'utente: restituisce solo l'ora del server.
-- Da eseguire nel SQL Editor di Supabase dopo 003_movimenti_destinazione.sql.

create or replace function public.segnale_attivita()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$
  select now();
$$;

-- Può essere chiamata con la sola chiave publishable (ruolo anon), senza login
revoke all on function public.segnale_attivita() from public;
grant execute on function public.segnale_attivita() to anon, authenticated;
