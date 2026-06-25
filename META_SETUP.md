# Ativar a automação do Instagram (comentário → DM)

O código está **pronto-pra-ativar**. Falta criar o App na Meta e preencher as
variáveis de ambiente. A automação só funciona **em produção (HTTPS público)** —
o webhook da Meta não aceita `localhost` (em dev, use um túnel como ngrok).

## 1. Pré-requisitos da conta
- O Instagram do profissional precisa ser **conta Business ou Creator**.
- Essa conta precisa estar **vinculada a uma Página do Facebook**.

## 2. Criar o App na Meta
1. https://developers.facebook.com → **Criar app** → tipo **Business**.
2. Adicione o produto **Instagram Graph API** (e **Facebook Login**).
3. Em **Configurações → Básico**, copie **App ID** e **App Secret**.
4. Permissões necessárias (entram no **App Review** para uso público):
   `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`,
   `pages_show_list`, `pages_manage_metadata`, `business_management`.
   *(Em desenvolvimento, funcionam com contas de teste/roles do app sem review.)*

## 3. Facebook Login — Redirect URI
Em **Facebook Login → Configurações**, adicione a URL de callback:
`https://SEU_DOMINIO/api/instagram/callback`
(e a de dev, se usar túnel: `https://xxxx.ngrok.app/api/instagram/callback`).

## 4. Webhook
Em **Webhooks** (produto do app), assine o objeto **instagram**:
- **Callback URL:** `https://SEU_DOMINIO/api/webhooks/instagram`
- **Verify token:** o mesmo valor de `META_WEBHOOK_VERIFY_TOKEN` no seu `.env`.
- Campos: marque **comments** (e `messages` se quiser).
A Meta faz um GET de verificação; nossa rota responde o `hub.challenge`
automaticamente. A inscrição da Página é feita pelo app no momento da conexão
(`subscribed_apps`).

## 5. Variáveis de ambiente
```
META_APP_ID=...
META_APP_SECRET=...
META_WEBHOOK_VERIFY_TOKEN=algum-segredo-que-voce-define
META_GRAPH_VERSION=v21.0
NEXT_PUBLIC_SITE_URL=https://SEU_DOMINIO
```

## 6. Como o profissional conecta
No app: **Automações → Conectar Instagram**. Isso abre o login do Facebook,
descobre a Página + a conta IG Business, salva o token (tabela
`instagram_connections`, só acessível pela service role) e inscreve os webhooks.

## 7. Como funciona em produção
1. Alguém comenta uma palavra-chave num post.
2. A Meta chama `POST /api/webhooks/instagram` (validamos a assinatura).
3. Casamos a palavra-chave com uma automação ativa do profissional.
4. Respondemos publicamente ao comentário (opcional) e enviamos a **DM** com o
   link do funil escolhido na automação.
5. Idempotência por `comment_id` (tabela `instagram_events`) evita reenvio.

## Segurança / notas
- Tokens ficam em `instagram_connections` (RLS sem policies → só service role);
  nunca vão ao navegador.
- O webhook valida `X-Hub-Signature-256` com o App Secret.
- Tokens de página de longa duração (~60 dias) — renovação periódica é um
  próximo passo (cron) se necessário.
