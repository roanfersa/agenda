# Ativar a automação do Instagram (comentário → DM)

Usamos o **"Login do Instagram"** (Instagram API with Instagram login): o
profissional conecta com a **própria conta do Instagram**, **sem precisar de
Página do Facebook**. O código está pronto-pra-ativar; falta criar o App e
preencher as variáveis de ambiente.

> A automação só funciona em **produção (HTTPS público)** — o webhook do
> Instagram não aceita `localhost`. Em dev, use um túnel (ngrok).

## 1. Pré-requisito do usuário
- A conta precisa ser **Instagram Profissional** (Comercial ou Criador de
  conteúdo). Conversão: app do Instagram → Configurações → Conta → Mudar para
  conta profissional. **Não precisa de Página do Facebook.**

## 2. Criar o App
1. https://developers.facebook.com → **Criar app** → caso de uso que inclua
   **Instagram** (ou adicione o produto **Instagram**).
2. No produto **Instagram → API setup with Instagram login**, copie o
   **Instagram App ID** e o **Instagram App Secret**.
3. Permissões (entram no **App Review** para uso público; em dev funcionam com
   contas de teste/roles do app):
   `instagram_business_basic`, `instagram_business_manage_comments`,
   `instagram_business_manage_messages`.

## 3. OAuth — Redirect URI
Em **Instagram → API setup with Instagram login → Business login settings**,
adicione a URL de callback:
`https://SEU_DOMINIO/api/instagram/callback`
(e a de dev com túnel, se for testar antes do deploy).

## 4. Webhook
Em **Instagram → Webhooks**, configure:
- **Callback URL:** `https://SEU_DOMINIO/api/webhooks/instagram`
- **Verify token:** o mesmo valor de `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`.
- Campos: **comments** (e `messages` se quiser).
A Meta faz um GET de verificação; nossa rota responde o `hub.challenge`.
A inscrição da conta é feita pelo app na hora da conexão (`subscribed_apps`).

## 5. Variáveis de ambiente
```
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=algum-segredo-que-voce-define
INSTAGRAM_GRAPH_VERSION=v21.0
NEXT_PUBLIC_SITE_URL=https://SEU_DOMINIO
```

## 6. Como o profissional conecta (UX)
**Automações → Conectar Instagram** abre um checklist rápido (conta
profissional? é admin?) e depois o **login do Instagram**. Ao autorizar,
salvamos o token (tabela `instagram_connections`, só service role) e inscrevemos
os webhooks. Sem Página do Facebook, sem fricção extra.

## 7. Como funciona em produção
1. Alguém comenta uma palavra-chave num post.
2. A Meta chama `POST /api/webhooks/instagram` (validamos a assinatura com o App
   Secret).
3. Casamos a palavra-chave com uma automação ativa do profissional.
4. Respondemos publicamente (opcional) e enviamos a **DM** com o link do funil
   escolhido na automação.
5. Idempotência por `comment_id` (tabela `instagram_events`).

## Segurança / notas
- Tokens em `instagram_connections` (RLS sem policies → só service role); nunca
  vão ao navegador.
- Webhook valida `X-Hub-Signature-256` com o Instagram App Secret.
- Token de longa duração (~60 dias); renovação periódica (cron) é um próximo
  passo se necessário.
