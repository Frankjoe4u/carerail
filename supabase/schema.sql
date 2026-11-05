create table if not exists public.invoices (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;
-- The app reads and writes through the service role key on the server only.
