-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Agendaí — schema inicial (multi-tenant por professional_id + RLS)          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Derivado de src/lib/types.ts. Tabelas de tenant isolam por professional_id =
-- auth.uid(). Submit público de lead e webhooks usam a service_role (ignora RLS).

-- ─── ENUMs ───────────────────────────────────────────────────────────────────
create type objetivo        as enum ('agendar', 'qualificar', 'capturar');
create type modo            as enum ('agendar', 'capturar', 'ambos');
create type metodo          as enum ('ia', 'manual');
create type funnel_status   as enum ('rascunho', 'publicado', 'pausado');
create type lead_status     as enum ('novo', 'agendado', 'em_conversa');
create type plano           as enum ('entrada', 'pro', 'setup');
create type sub_status      as enum ('em_dia', 'atrasado', 'cancelado', 'trial');
create type setup_status    as enum ('solicitado', 'em_montagem', 'aguardando_cliente', 'concluido');
create type lgpd_tipo       as enum ('acesso', 'correcao', 'exclusao');
create type lgpd_status     as enum ('pendente', 'concluido');
create type origem          as enum ('instagram', 'link');
create type modalidade      as enum ('online', 'presencial');
create type appt_status     as enum ('confirmado', 'cancelado');
create type papel_interno   as enum ('admin', 'operacao', 'financeiro');

-- ─── professionals (1:1 com auth.users) ───────────────────────────────────────
create table professionals (
  id                          uuid primary key references auth.users(id) on delete cascade,
  nome                        text not null default '',
  handle_instagram            text not null default '',
  especialidade               text not null default '',
  atende                      text not null default '',
  foto_url                    text,
  cor                         text not null default '#0E8A6B',
  whatsapp                    text not null default '',
  google_calendar             jsonb not null default '{"conectado":false,"email":"","calendarId":""}'::jsonb,
  plano                       plano not null default 'entrada',
  avisos                      jsonb not null default '{"email":true,"push":true}'::jsonb,
  consentimento_texto_padrao  text not null default '',
  stripe_customer_id          text,
  onboarding_done             boolean not null default false,
  criado_em                   timestamptz not null default now()
);

-- ─── funnels ───────────────────────────────────────────────────────────────────
create table funnels (
  id                   uuid primary key default gen_random_uuid(),
  professional_id      uuid not null references professionals(id) on delete cascade,
  slug                 text not null unique,
  nome                 text not null default 'Novo funil',
  uso                  text not null default '',
  objetivo             objetivo not null default 'agendar',
  metodo               metodo not null default 'ia',
  modo                 modo not null default 'ambos',
  campos_contato       jsonb not null default '{"email":true,"whatsapp":true}'::jsonb,
  contato_quando       text not null default 'fim',
  contexto             jsonb not null default '[]'::jsonb,
  mensagem_boas_vindas text not null default '',
  perguntas            jsonb not null default '[]'::jsonb,
  consentimento_texto  text not null default '',
  status               funnel_status not null default 'rascunho',
  criado_em            timestamptz not null default now()
);
create index on funnels (professional_id);

-- ─── leads ─────────────────────────────────────────────────────────────────────
create table leads (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  funnel_id       uuid not null references funnels(id) on delete cascade,
  nome            text not null,
  whatsapp        text not null default '',
  email           text,
  respostas       jsonb not null default '[]'::jsonb,
  resumo_ia       text not null default '',
  resumo_editado  boolean not null default false,
  status          lead_status not null default 'novo',
  consentimento   jsonb not null default '{"dado":false,"dataHora":""}'::jsonb,
  origem          origem not null default 'link',
  novo            boolean not null default true,
  criado_em       timestamptz not null default now()
);
create index on leads (professional_id);
create index on leads (funnel_id);

-- ─── appointments ────────────────────────────────────────────────────────────
create table appointments (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references professionals(id) on delete cascade,
  lead_id          uuid not null references leads(id) on delete cascade,
  dia_rotulo       text not null default '',
  data_hora        text not null default '',
  hora             text not null default '',
  tipo_atendimento text not null default '',
  modalidade       modalidade not null default 'online',
  status           appt_status not null default 'confirmado',
  google_event_id  text,
  criado_em        timestamptz not null default now()
);
create index on appointments (professional_id);

-- ─── availability ──────────────────────────────────────────────────────────────
create table availability (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  rotulo          text not null,
  dia             text not null,
  horarios        jsonb not null default '[]'::jsonb
);
create index on availability (professional_id);

-- ─── automations ───────────────────────────────────────────────────────────────
create table automations (
  id                     uuid primary key default gen_random_uuid(),
  professional_id        uuid not null references professionals(id) on delete cascade,
  ativa                  boolean not null default false,
  post_legenda           text not null default '',
  post_tipo              text not null default '',
  post_emoji             text not null default '',
  keywords               jsonb not null default '[]'::jsonb,
  resposta_publica       boolean not null default true,
  resposta_publica_texto text not null default '',
  dm_mensagem            text not null default '',
  dm_botao               text not null default '',
  stats                  jsonb not null default '{"comentarios":0,"dms":0,"leads":0}'::jsonb,
  criado_em              timestamptz not null default now()
);
create index on automations (professional_id);

-- ─── notifications ─────────────────────────────────────────────────────────────
create table notifications (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  lead_id         uuid references leads(id) on delete cascade,
  nome            text not null default '',
  texto           text not null default '',
  canais          text not null default '',
  quando          text not null default '',
  lida            boolean not null default false,
  criado_em       timestamptz not null default now()
);
create index on notifications (professional_id);

-- ─── subscriptions (espelho do Stripe) ─────────────────────────────────────────
create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  professional_id        uuid not null references professionals(id) on delete cascade,
  plano                  plano not null,
  valor                  integer not null default 0,
  ciclo                  text not null default 'mensal',
  status                 sub_status not null default 'em_dia',
  stripe_subscription_id text unique,
  current_period_end     timestamptz,
  criado_em              timestamptz not null default now()
);
create index on subscriptions (professional_id);

-- ─── setup_tasks ───────────────────────────────────────────────────────────────
create table setup_tasks (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  status          setup_status not null default 'solicitado',
  valor           integer not null default 0,
  responsavel_id  uuid,
  responsavel     text not null default '—',
  criado_em       timestamptz not null default now()
);

-- ─── lgpd_requests ─────────────────────────────────────────────────────────────
create table lgpd_requests (
  id                uuid primary key default gen_random_uuid(),
  professional_id   uuid references professionals(id) on delete set null,
  lead_id           uuid references leads(id) on delete set null,
  lead_nome         text not null default '',
  professional_nome text not null default '',
  tipo              lgpd_tipo not null,
  status            lgpd_status not null default 'pendente',
  prazo             text not null default '',
  criado_em         timestamptz not null default now()
);

-- ─── consent_log (auditoria LGPD) ──────────────────────────────────────────────
create table consent_log (
  id                uuid primary key default gen_random_uuid(),
  professional_id   uuid references professionals(id) on delete set null,
  lead_id           uuid references leads(id) on delete set null,
  lead_nome         text not null default '',
  professional_nome text not null default '',
  data_hora         text not null default '',
  texto             text not null default ''
);

-- ─── internal_users (equipe interna / admin) ───────────────────────────────────
create table internal_users (
  id    uuid primary key references auth.users(id) on delete cascade,
  nome  text not null default '',
  email text not null,
  papel papel_interno not null default 'operacao'
);

create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  internal_user text not null default '',
  acao          text not null default '',
  data_hora     timestamptz not null default now()
);

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ Helpers                                                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
create or replace function is_internal()
returns boolean language sql security definer stable as $$
  select exists (select 1 from internal_users where id = auth.uid());
$$;

-- Cria a linha em professionals automaticamente quando um usuário se cadastra.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.professionals (id, nome, especialidade)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    coalesce(new.raw_user_meta_data->>'especialidade', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ RLS — tenant isola por professional_id = auth.uid()                        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
alter table professionals  enable row level security;
alter table funnels        enable row level security;
alter table leads          enable row level security;
alter table appointments   enable row level security;
alter table availability   enable row level security;
alter table automations    enable row level security;
alter table notifications  enable row level security;
alter table subscriptions  enable row level security;
alter table setup_tasks    enable row level security;
alter table lgpd_requests  enable row level security;
alter table consent_log    enable row level security;
alter table internal_users enable row level security;
alter table audit_log      enable row level security;

-- professionals: dono lê/edita o próprio registro; equipe interna lê tudo.
create policy "own_professional_select" on professionals for select
  using (id = auth.uid() or is_internal());
create policy "own_professional_insert" on professionals for insert
  with check (id = auth.uid());
create policy "own_professional_update" on professionals for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Macro de políticas tenant (dono CRUD; interno leitura).
do $$
declare t text;
begin
  foreach t in array array[
    'funnels','leads','appointments','availability','automations',
    'notifications','subscriptions','setup_tasks'
  ] loop
    execute format($f$
      create policy "tenant_select" on %1$I for select
        using (professional_id = auth.uid() or is_internal());
      create policy "tenant_insert" on %1$I for insert
        with check (professional_id = auth.uid());
      create policy "tenant_update" on %1$I for update
        using (professional_id = auth.uid()) with check (professional_id = auth.uid());
      create policy "tenant_delete" on %1$I for delete
        using (professional_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- lgpd / consent: dono e interno leem; escrita via service role ou interno.
create policy "lgpd_select" on lgpd_requests for select
  using (professional_id = auth.uid() or is_internal());
create policy "lgpd_update_internal" on lgpd_requests for update
  using (is_internal()) with check (is_internal());
create policy "consent_select" on consent_log for select
  using (professional_id = auth.uid() or is_internal());

-- internal_users / audit_log: só equipe interna.
create policy "internal_self_select" on internal_users for select
  using (id = auth.uid() or is_internal());
create policy "audit_internal" on audit_log for select using (is_internal());

-- NOTA: role `anon` não tem nenhuma policy → não lê/escreve nada.
-- O funil público (/f/[slug]) e os webhooks usam a service_role no servidor.
