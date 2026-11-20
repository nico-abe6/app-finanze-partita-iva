-- 003_movimenti_destinazione.sql
-- Permette di indicare un conto di destinazione anche per "risparmio" e "investimento"
-- (es. 200 € dal conto corrente al conto risparmi). Resta obbligatorio per "trasferimento"
-- e vietato per "entrata" e "uscita". Il conto di destinazione deve essere diverso da quello di origine.
-- Da eseguire nel SQL Editor di Supabase dopo 002_preferenze_dashboard.sql.

-- Toglie il vecchio vincolo "destinazione solo per i trasferimenti" (il nome è stato assegnato da Postgres)
do $$
declare
  nome_vincolo text;
begin
  select conname into nome_vincolo
  from pg_constraint
  where conrelid = 'public.movimenti'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%trasferimento%'
    and pg_get_constraintdef(oid) like '%conto_destinazione_id IS NOT NULL%';
  if nome_vincolo is not null then
    execute format('alter table public.movimenti drop constraint %I', nome_vincolo);
  end if;
end $$;

alter table public.movimenti
  add constraint movimenti_destinazione_valida check (
    case tipo
      when 'trasferimento' then conto_destinazione_id is not null
      when 'risparmio' then true
      when 'investimento' then true
      else conto_destinazione_id is null
    end
  ),
  add constraint movimenti_destinazione_diversa check (
    conto_destinazione_id is null or conto_destinazione_id <> conto_id
  );
