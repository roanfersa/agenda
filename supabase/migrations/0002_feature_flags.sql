-- Feature flags por usuário (overrides do admin).
-- Acesso efetivo = override ?? default do plano (resolvido em código: src/lib/features.ts).
alter table professionals
  add column if not exists feature_flags jsonb not null default '{}'::jsonb;
