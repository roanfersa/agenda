# Agendaí — Setup de Produção

Guia para colocar o produto no ar com **Supabase** (banco + auth), **Stripe**
(cobrança) e **Claude** (IA). O código já está integrado; faltam apenas
provisionar as contas e preencher as variáveis de ambiente.

## 1. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha. Em produção, configure as
mesmas variáveis no painel da Vercel.

## 2. Supabase

1. Crie um projeto em https://app.supabase.com.
2. Em **SQL Editor**, rode as migrations em ordem: `supabase/migrations/0001_initial_schema.sql`
   (tabelas, RLS, trigger de signup, `is_internal()`), `0002_feature_flags.sql`
   (feature flags), `0003_biolink.sql` (tema/blocos/produtos/preview do bio-link)
   `0004_storage_branding.sql` (policies do Storage), `0005_context_library.sql`
   (biblioteca de contexto reutilizável) e `0006_storage_contexto.sql`.
   Crie também dois buckets de Storage **públicos**: `branding`
   (logos/avatars/fundos) e `contexto` (materiais: PDFs, docs, etc.).
   Obs.: o host direto do banco é IPv6-only; para aplicar via `psql`/CI use o
   **pooler** (`aws-1-sa-east-1.pooler.supabase.com`, usuário `postgres.<ref>`).
3. Em **Project Settings → API**, copie `Project URL`, `anon key` e
   `service_role key` para o `.env.local`.
4. **Auth → Providers**: deixe e-mail/senha habilitado. Para o "Entrar com
   Google", habilite o provider Google e adicione a URL de callback
   `https://SEU_DOMINIO/auth/callback` (e `http://localhost:3000/auth/callback`
   em dev).
5. Para liberar o painel admin a alguém, insira o usuário em `internal_users`
   (veja `supabase/seed.sql`).

## 3. Stripe

1. Crie produtos/preços em **Produtos** (BRL): Entrada R$97/mês, Pro R$297/mês
   (recorrentes) e Setup (pagamento avulso). Copie os `price_...` para o env.
2. Copie `Secret key` e `Publishable key` (use chaves de teste em dev).
3. **Webhook**: aponte um endpoint para `https://SEU_DOMINIO/api/webhooks/stripe`
   com os eventos `checkout.session.completed`,
   `customer.subscription.created/updated/deleted` e `invoice.payment_failed`.
   Copie o `Signing secret` (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
   Em dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

## 4. Claude (IA)

Crie uma chave em https://console.anthropic.com/settings/keys e defina
`ANTHROPIC_API_KEY`. Se ausente, a IA degrada graciosamente (resumo simples,
follow-up genérico, e o gerador de funil mostra aviso).

## 5. Rodar e deploy

```bash
npm install
npm run dev        # local
npm run build      # validar produção
```

Deploy recomendado na **Vercel** (detecta Next.js 16). Configure todas as env
vars de produção, inclusive `NEXT_PUBLIC_SITE_URL` com o domínio real.

## Arquitetura (resumo)

- `src/proxy.ts` — refresh de sessão Supabase + gate de rotas (Next 16 usa
  `proxy`, não `middleware`).
- `src/lib/supabase/{client,server,admin}.ts` — clientes (browser / server /
  service-role). A service role só é usada em `api/lead`, `api/webhooks/stripe`
  e no carregamento do funil público.
- `src/lib/store.ts` — Zustand como **cache**: hidratado de `/api/bootstrap`;
  mutações chamam Server Actions (`src/lib/actions/*`) e atualizam o cache.
- `src/app/f/[slug]` — funil público (server-rendered); submit em `/api/lead`.
- `src/lib/ai/*` + `src/app/api/ai/*` — resumo de lead, gerador de funil,
  follow-up.
- `src/app/api/{checkout,billing-portal,webhooks/stripe}` — cobrança.

## Trabalho restante (próximas ondas)

- **Painel admin (LadoC)** lê listas globais (profissionais, assinaturas,
  setups, LGPD). Falta um `/api/admin/bootstrap` (service-role + checagem
  `is_internal`) para hidratar essas telas com dados reais. A RLS já impede
  vazamento; hoje as listas aparecem vazias para quem não tem dados.
- **LGPD real**: export e exclusão de dados do lead a partir de `/admin/lgpd`.
- **Integrações Meta** (WhatsApp Cloud API / Instagram Graph API): a fronteira
  está isolada em `src/lib/integrations/meta.ts` em modo demo. Implementar após
  aprovação da conta na Meta Business. WhatsApp de saída já funciona via `wa.me`.
- **Google Calendar**: OAuth real para criar eventos (hoje a conexão é demo).
