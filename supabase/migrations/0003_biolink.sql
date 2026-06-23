-- Bio-link SaaS: identidade visual, blocos (Linktree), preset de fluxo,
-- catálogo de produtos (pra IA recomendar) e token de preview de rascunho.
alter table funnels
  add column if not exists theme         jsonb not null default '{}'::jsonb,
  add column if not exists blocks        jsonb not null default '[]'::jsonb,
  add column if not exists produtos      jsonb not null default '[]'::jsonb,
  add column if not exists flow_preset   text  not null default 'bio_quiz',
  add column if not exists preview_token text;

-- Gera token de preview pros funis existentes e pros novos (default).
update funnels set preview_token = gen_random_uuid()::text where preview_token is null;
alter table funnels alter column preview_token set default gen_random_uuid()::text;
alter table funnels alter column preview_token set not null;

create unique index if not exists funnels_preview_token_idx on funnels(preview_token);
