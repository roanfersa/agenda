-- ─── google_connections ───────────────────────────────────────────────────────
-- Tokens OAuth do Google Calendar por profissional. RLS habilitado SEM políticas:
-- apenas o service role (server-side) acessa — os tokens nunca vão ao cliente.
create table if not exists google_connections (
  professional_id  uuid primary key references professionals(id) on delete cascade,
  email            text not null default '',
  access_token     text not null,
  refresh_token    text not null default '',
  token_expires_at timestamptz,
  calendar_id      text not null default 'primary',
  connected_at     timestamptz not null default now()
);
alter table google_connections enable row level security;
