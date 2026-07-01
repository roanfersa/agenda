create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  funnel_id uuid references funnels(id) on delete set null,
  recurso_id text,
  tipo text not null,
  fonte text not null default '',
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
create index if not exists events_prof_criado_idx on events (professional_id, criado_em);
alter table events enable row level security;
drop policy if exists events_tenant_select on events;
create policy events_tenant_select on events for select using (professional_id = auth.uid() or is_internal());

alter table leads add column if not exists recurso_id text;
alter table leads add column if not exists fonte text not null default '';
