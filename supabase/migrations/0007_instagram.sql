-- Integração real com Instagram (comentário → DM via Graph API).
-- Tokens ficam numa tabela SEM policies de cliente: só a service role acessa
-- (OAuth callback, webhook e leitura de status server-side). Nunca vão ao browser.

create table instagram_connections (
  professional_id   uuid primary key references professionals(id) on delete cascade,
  ig_user_id        text not null,
  ig_username       text not null default '',
  page_id           text,
  access_token      text not null,
  token_expires_at  timestamptz,
  connected_at      timestamptz not null default now()
);
create index on instagram_connections (ig_user_id);
alter table instagram_connections enable row level security;
-- (sem policies → bloqueado para anon/authenticated; só service role)

-- Idempotência: cada comentário é processado uma única vez.
create table instagram_events (
  id              text primary key,
  professional_id uuid references professionals(id) on delete cascade,
  processed_at    timestamptz not null default now()
);
alter table instagram_events enable row level security;

-- Qual funil/link a automação envia no DM.
alter table automations
  add column if not exists funnel_id uuid references funnels(id) on delete set null;
