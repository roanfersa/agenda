# Agendaí — Jornadas dos Usuários & Funcionalidades

> Protótipo navegável v1 · "O fim do 'chama no direct'."
> Ferramenta Brasil-first, em português, nativa de WhatsApp, para profissionais **solo** de saúde/estética e serviços. Substitui o "link na bio" passivo por um funil conversacional que **qualifica e agenda** (ou encaminha pro WhatsApp / time de vendas).

Este documento descreve, passo a passo, a jornada de cada tipo de usuário e lista todas as funcionalidades do protótipo.

---

## ⚠️ Para o agente de código — o que é referência e o que NÃO é

> Leia esta seção antes de implementar qualquer coisa. O protótipo é uma maquete de **fluxo, conteúdo e intenção de produto** — não uma base de código de produção.

### ✅ USE como referência (intenção vinculante)
- **As jornadas e a máquina de estados** descritas neste documento (ordem dos passos, ramificações por objetivo, regras como "contato após o slot, dentro da reserva").
- **As regras de negócio**: reserva de slot por 10 min com expiração, WhatsApp como fallback (não opção paralela), objetivo inferido da frase, IA pergunta 1–2 coisas antes de gerar, resumo da IA editável e único.
- **O modelo de dados** (entidades e campos descritos na seção própria): Professional, Funnel, Question, Lead, Appointment, Subscription, SetupTask, etc.
- **O conteúdo/microcopy em PT-BR** e o tom (informal, "você") como ponto de partida de UX writing.
- **A taxonomia de telas** e o que cada uma faz (os três lados, navegação, estados de vazio/erro).
- **A direção visual** apenas como intenção (mobile-first, acolhedor). As cores/tipografia finais devem vir do **design system oficial do projeto**, não dos valores hardcoded do protótipo.

### ❌ NÃO use como referência (andaime do protótipo)
- **A arquitetura do código**: o store observável em memória (`store.js`), o uso de React via Babel no navegador, os arquivos `ladoA_*.jsx` / `ladoB.jsx` / `ladoC*.jsx`. É descartável — não reproduza essa estrutura num app real.
- **Os dados mockados e seeds** (Osvaldo, leads de exemplo, métricas do backoffice, valores de MRR): são ilustrativos, não dados reais nem regras de cálculo.
- **As integrações simuladas**: o "consentimento do Google" mockado, os horários livres fixos, o `wa.me` com texto pré-preenchido, o upload de PDF que só mostra o nome do arquivo, o "envio" de e-mail/push. A integração de verdade (Google Calendar API, OAuth, WhatsApp `wa.me`, storage de arquivos, provedor de e-mail/push) é responsabilidade da implementação.
- **Os valores visuais hardcoded** (hex, px, sombras, raios) dentro dos componentes do protótipo — substituir pelos tokens do design system.
- **Atalhos de protótipo**: o alternador Celular/Desktop, o "Mapa de telas", o botão "simular expiração", o "entrar como" sem auth real, qualquer toast de "(mock)". São ferramentas de demonstração, não features do produto.
- **Pagamentos/cobrança**: telas de Planos e Assinaturas são estáticas; não há gateway. Tratar como placeholder de UI.

### Em resumo
Implemente **o quê** (fluxos, regras, conteúdo, dados) — não **o como** (a stack do protótipo). Quando houver conflito entre o visual hardcoded do protótipo e o design system do projeto, **o design system vence**.

---

## Os três lados do produto

| Lado | Quem usa | Dispositivo | O que faz |
|------|----------|-------------|-----------|
| **A — App do profissional** | O cliente pagante (ex.: Osvaldo, terapeuta) | Mobile **e** Desktop | Cria os funis, conecta a agenda, recebe e gerencia leads e agendamentos |
| **B — Funil público** | O lead (seguidor do Instagram) | Mobile, sem login | A conversa que qualifica e agenda / encaminha |
| **C — Backoffice** | A equipe interna | Desktop | Operação: profissionais, planos, setups, LGPD, equipe |

Há ainda um **Mapa de telas** — índice navegável de todas as telas dos três lados.

---

## Lado A — Jornada do Profissional (quem paga)

O profissional usa o app no **celular ou no desktop** (alternador Celular/Desktop no topo). A jornada vai do cadastro até a gestão diária de leads.

### 1. Entrar / Cadastro
1. O profissional chega na tela com a frase de valor *"O fim do 'chama no direct'."*
2. Escolhe entre **Entrar** ou **Criar conta** (toggle no mesmo card).
3. Pode entrar com **Google** (preferencial — já alinha com a conexão de agenda depois) ou com **e-mail e senha**.
4. Ao criar conta, segue direto para o onboarding.

### 2. Onboarding — Setup do funil (o coração do produto)
Fluxo multi-etapas, uma pergunta por tela, com barra de progresso. **Não é um builder em branco** — é guiado.

**Etapa 1 · Seu perfil**
- Cola o **@ do Instagram**.
- Escreve **em uma frase** o que faz (ex.: *"Sou terapeuta tântrico e atendo ansiedade e autoconhecimento."*).
- Sem informar online/presencial, preços ou horários — isso o funil pergunta ao lead depois.
- Ao continuar, o sistema **infere o objetivo do funil** a partir dessa frase (ex.: "atendo / paciente / sessão" → Agendar).

**Etapa 2 · Criar o funil**
- **Objetivo inferido, já sugerido** — a tela abre com a **sugestão** em destaque, em linguagem de benefício (ex.: *"Encher a agenda com horários marcados"*), não em jargão de funil. Os outros objetivos ficam como **alternativa secundária** ("Não é isso? Use pra…"):
  - *Encher a agenda com horários marcados* (Agendar) — consultas, sessões, avaliações.
  - *Falar só com quem tá pronto pra fechar* (Qualificar/SDR) — serviços, B2B, alto ticket.
  - *Pegar o contato pra não perder ninguém* (Capturar) — dúvidas, lista de interesse.
- **Materiais pra IA** (opcional) — anexa **PDFs** (tabela de preços, ementa, FAQ) e **links**; a IA usa esse material pra escrever com a linguagem do profissional.
- **Montar com a IA** (recomendado) **ou manualmente**:
  - *IA* — gera a mensagem de boas-vindas e as perguntas adaptadas ao objetivo.
  - *Manual* — abre o mesmo editor em branco pra escrever do zero.
- **A IA pergunta antes de gerar** — quando o profissional escolhe a IA, antes de montar ela faz **1–2 perguntas rápidas** (ex.: *"Você atende online, presencial ou os dois?"* e *"Quando você costuma atender?"*). As respostas afinam o roteiro (ex.: se atende só online, a pergunta de modalidade nem aparece). A geração só acontece depois disso — nada de perguntas genéricas a partir de uma única frase.

**Etapa 2 (editor) · Revisar/ajustar o funil**
- Vê o funil já pronto (quando IA) ou em branco (quando manual).
- Define o **nome do funil**.
- Edita a **mensagem de boas-vindas** (toque pra editar).
- Edita as **perguntas de qualificação**: adicionar/remover, editar texto, alternar entre *Opções* e *Texto livre*, adicionar/editar/remover opções, ligar/desligar.
- Configura os **dados de contato** a coletar: **Nome** (sempre, obrigatório), **E-mail** (liga/desliga) e **WhatsApp** (liga/desliga). O **quando pedir** (após a 1ª pergunta ou no final) só aparece nos objetivos sem agenda — no Agendar o contato é fixo (após o slot, dentro da reserva).
- Aviso de LGPD: perguntas de logística, nada sensível.

**Etapa 3 · Conectar Google Agenda** (somente se o objetivo for *Agendar*)
- Explicação curta e botão **Conectar Google Agenda** → simula a tela de consentimento do Google → estado **conectado** (✓ com e-mail e nome do calendário).
- Pode conectar depois.

**Etapa 4 · Quase lá — Seu contato**
- Define **nome de exibição** + **foto** (puxada do @) e **WhatsApp** (máscara BR).
- Esses dados aparecem no topo do funil público e no handoff.

**Etapa final · Publicar**
- Tela de sucesso com o **link da bio** gerado (`agendai.com.br/f/osvaldo`).
- Botões **Copiar link** e **Compartilhar**.
- CTA para ir ao painel.

### 3. Início (Dashboard)
- Saudação ("Oi, Osvaldo 👋").
- **Link da bio** sempre visível no topo (copiar/compartilhar) — a ação recorrente.
- **Sino de avisos** com contador de não lidos: abre os **avisos de lead novo** (ver abaixo). No desktop, um banner *"X leads novos entraram — você foi avisado por e-mail e push"*.
- Cards de visão rápida: **Leads novos** (com badge), **Agendamentos**, **Leads na semana** (e taxa de qualificação no desktop).
- Atalho para as **Automações do Instagram** (recurso Pro).
- Lista dos **últimos leads** (nome + resumo de uma linha gerado pela IA + horário) → toca e vai ao detalhe.
- Estado vazio amigável quando ainda não há leads.

**Aviso de lead novo (v1, fecha o loop):** o profissional solo não fica olhando o app. Por isso, quando entra um lead, ele é avisado **por e-mail e push** (configurável em Ajustes), com link direto pro detalhe. Os avisos ficam no sino; um toast *"🔔 Lead novo"* aparece se o app estiver aberto. *(A API proativa do WhatsApp segue no anti-escopo — isto é só o aviso básico.)*

### 4. Leads
- Lista de todos os leads, mais recentes no topo.
- Cada item: nome, inicial/foto, **resumo de uma linha gerado pela IA** (com marca de *editado* quando o profissional ajustou), status (Novo / Agendado / Em conversa), horário de entrada, indicador de "novo".
- **Filtro** por status e **busca** por nome.
- No desktop: layout **master-detail** (lista à esquerda, detalhe à direita).
- Reforço de que o histórico fica salvo aqui (o fosso/retenção).

### 5. Detalhe do lead
- Topo: nome, **WhatsApp** e **e-mail** (conforme coletado), status, data.
- Botão **Abrir no WhatsApp** (ou **Enviar e-mail** se o funil não coletar WhatsApp).
- **Resumo gerado pela IA** em destaque (o que a pessoa quer, respostas, e — se agendou — quando). O profissional pode **editar o resumo** ali mesmo; quando editado, ganha o selo *"editado por você"*. O resumo é **um dado único**: a edição propaga na hora para os três lugares onde aparece (Dashboard, lista de Leads e Detalhe), e passa a fazer parte do histórico (reforça a retenção e corrige um eventual erro da IA).
- Lista das **respostas do funil** (pergunta → resposta).
- Card do **agendamento** (se houver), com link pra agenda.
- Indicação de **consentimento LGPD** registrado (data e hora).

### 6. Agenda
- Lista de **próximos agendamentos** agrupados por dia (data, hora, nome, tipo, modalidade online/presencial).
- Indicação de sincronização com o Google Agenda.
- Cada item leva ao detalhe do lead.
- Estado vazio amigável.

### 7. Funis (múltiplos funis, com uso claro)
- Lista de **todos os funis** do profissional, cada um com objetivo, **uso** (ex.: *Bio do Instagram*, *Campanha paga / Stories*), status (Publicado/Pausado), **link próprio** e contagem de leads.
- Banner explicativo: *cada funil tem seu próprio link; o marcado **NA BIO** é o que vai no Instagram, os outros você usa em campanha paga, stories ou anúncio* — e os leads ficam separados por origem. É isso que justifica ter mais de um para o profissional solo.
- **Novo funil** (abre o onboarding guiado no celular; cria e abre o editor no desktop).
- Ações por funil: **Editar**, **Usar na bio** (define o ativo), **Pausar/Publicar**, **Excluir**.
- Só um funil é o **ativo da bio** por vez; trocar é um toque.

### 8. Editar funil
- Mesmo editor do onboarding, para um funil já publicado.
- Edita objetivo, mensagem de boas-vindas, perguntas, dados de contato e texto de consentimento.
- **Prévia ao vivo** de como o lead vê (lado a lado no desktop, aba no celular).
- **Salvar e republicar**.

### 9. Automações do Instagram (comentário → DM) · Recurso Pro
- Conexão da conta (@) e visão geral (DMs enviadas, leads gerados).
- Lista de **automações**: post + palavras-gatilho (ex.: `QUERO`, `AJUDA`) + prévia da DM + estatísticas (comentários → DMs → leads), com liga/desliga.
- **Editor**: escolhe o post, define palavras-chave, resposta pública no comentário, mensagem da DM e botão que abre o bio-funil.
- **Simulador ao vivo**: tela dividida — comenta a palavra-chave no post (esquerda) e vê a **resposta pública** + a **DM sair sozinha** com o botão do funil (direita). Sem a palavra, nada é enviado.

### 10. Configurações
- Perfil (nome, foto, especialidade).
- WhatsApp.
- Conexão Google Agenda (status, conectar/desconectar).
- Acesso a **Meus funis** e **Automações**.
- **Avisos de lead novo** — toggles de **e-mail** e **push** (v1).
- **Texto de consentimento LGPD** editável (com padrão pronto).
- Encarregado/DPO (exibição).
- Plano atual e link para Planos.

### 11. Planos
- Três tiers (estáticos, sem pagamento real):
  - **Entrada — R$97/mês**: bio-funil + qualificação + agendamento + resumo no WhatsApp + leads/agenda ilimitados.
  - **Pro / "Secretária" — R$297/mês** *(em breve)*: automação de WhatsApp, comment→DM, follow-up por IA, lembrete, reagendamento, multi-atendente.
  - **Setup assistido — R$300–500** (única vez): "A gente monta seu funil pra você."
- Âncora de valor: *"Uma secretária custa R$1.500+/mês."*

---

## Lado B — Jornada do Lead (seguidor do Instagram)

Experiência **mobile, sem login**, em formato de **conversa de chat**. O topo fixo mostra foto + nome + especialidade do profissional. O fluxo se adapta ao **objetivo** do funil.

### Passo a passo (modo Agendar)
1. **Boas-vindas** — bolha personalizada do profissional ("Oi! Sou o Osvaldo 🌿 …").
2. **Qualificação** — 2–3 perguntas, uma por vez, com **botões de resposta rápida** (toque, não digitação) e indicador de progresso ("2 de 3"). As perguntas ajudam a definir o atendimento (ex.: o que interessa, online/presencial, período).
3. **Agendamento (caminho primário)** — terminada a qualificação, o funil vai **direto pros horários livres** (chips de dia + grade), sem oferecer escape paralelo. O foco é concluir o agendamento.
4. **Reserva provisória do horário** — ao escolher um slot, ele fica **reservado por 10 minutos** (com contagem regressiva visível) enquanto o lead conclui. Se o lead abandonar, o slot é **liberado automaticamente** ao expirar. *(Na demo, um link "simular expiração" mostra a liberação sem esperar os 10 min; a regra real continua sendo 10 min.)*
5. **Contato (ponto fixo no modo Agendar)** — cartão único pedindo **nome, e-mail e WhatsApp** (apenas os campos ativados), com validação. No modo Agendar o contato é **sempre** coletado aqui — logo após a escolha do horário e **dentro da janela de reserva** —, então o toggle "quando pedir" não se aplica (ele só vale para Qualificar e Capturar, que não têm slot a proteger).
6. **Consentimento LGPD** — bloco destacado com checkbox e link "ler aviso"; o botão final só habilita com o check marcado.
7. **Confirmação + handoff** — tela de sucesso com o horário marcado (a reserva vira confirmação) + botão grande **Abrir no WhatsApp** (link `wa.me` com mensagem pré-preenchida com o resumo).

### WhatsApp como fallback (não como escape)
- O WhatsApp **não** aparece como opção paralela ao agendamento. Ele é oferecido como **plano B**, dentro da tela de horários: *"Nenhum horário bom? Falar no WhatsApp"*. Só quem realmente não encontra horário cai pra lá — o caminho primário continua sendo concluir o agendamento. Isso preserva o "fim do 'chama no direct'".

### Variações por objetivo
- **Qualificar (SDR)** — sem agendamento; ao final, *"já te encaminhei pro nosso time de vendas"* + botão **Falar com o time**. O resumo marca o lead como qualificado para vendas.
- **Capturar contato** — coleta contato e encerra com *"é só continuar a conversa"* + botão **Falar no WhatsApp**.
- Nesses dois objetivos não há grade de horários nem reserva — o caminho primário é qualificar e encaminhar.

### Princípios da experiência
- Pouca fricção: respostas por toque, contato pedido só quando necessário.
- Aviso de privacidade lista **dinamicamente** os campos realmente coletados (LGPD).
- Transições suaves, visual de chat, sem parede de formulário.

---

## Lado C — Jornada da Equipe Interna (Backoffice)

Ferramenta **desktop, densa, orientada a tabelas e ações**. Acesso restrito por login interno e papéis. É onde a operação high-touch acontece.

### 1. Login interno
- Login separado (e-mail corporativo), sem cadastro aberto, com aviso visual de **ambiente restrito**.

### 2. Visão geral
- Cards de métricas: **Profissionais ativos**, **MRR estimado**, **Novos no mês**, **Setups na fila**, **Leads processados (semana)**.
- **Alertas operacionais** acionáveis: pagamentos falhos, contas sem agenda conectada, funis sem leads (risco de churn), pedidos LGPD pendentes.
- Gráfico de crescimento de profissionais ao longo do tempo.

### 3. Profissionais
- Tabela: nome, @Instagram, especialidade, plano, status (Ativo/Trial/Inadimplente/Cancelado), agenda conectada (✓/✗), nº de leads, data de cadastro.
- **Filtros** por status e **busca**; ação rápida pra abrir o detalhe.

### 4. Detalhe da conta
- Resumo do profissional: perfil, plano, status de pagamento, cadastro.
- **Funil publicado** (mesma prévia do Lado A), com objetivo e status.
- **Leads & agenda**: contagem e últimos leads.
- **Ações administrativas**: alterar plano, suspender/reativar, reenviar convite, **entrar como** (impersonar com aviso e registro no log), abrir setup assistido.
- **Histórico/auditoria**: ações administrativas registradas (quem, quando).

### 5. Fila de setups assistidos (done-for-you)
- **Kanban** por status: Solicitado → Em montagem → Aguardando cliente → Concluído.
- Cada card: profissional, especialidade, responsável interno, valor (R$300–500), avançar de etapa.

### 6. Assinaturas
- Tabela: profissional, plano, valor, ciclo, próximo vencimento, status (Em dia/Atrasado/Cancelado).
- Ações de visualização: ver histórico, marcar cobrança como resolvida (mock).
- Sem gateway real — apenas visualização/gestão.

### 7. LGPD
- **Pedidos de titular** (acesso, correção, exclusão): lista com status e prazo.
- **Logs de consentimento**: quando cada lead consentiu e com qual texto.
- **Exclusão de dados**: ação para anonimizar/excluir, com **dupla confirmação** e registro.
- Campo do Encarregado/DPO.

### 8. Equipe interna
- Lista de usuários com papéis: **Admin**, **Operação/Suporte**, **Financeiro**.
- Cada papel define o que vê/faz (só Admin pode "entrar como" e excluir dados LGPD).
- Convidar/remover membro (mock).

---

## Fluxo conectado (ponta a ponta)

O protótipo é **navegável de ponta a ponta** e tudo compartilha o mesmo estado:

```
Funil público (lead responde)
        ↓ cria lead + agendamento + log de consentimento
App do profissional  →  Início · Leads · Agenda  (aparece na hora)
        ↓ a conta do profissional já está lá
Backoffice  →  Profissionais · Assinaturas · LGPD
```

1. O profissional se cadastra → cria o funil (IA ou manual) → conecta a agenda → publica → recebe o link.
2. Pelo link, um lead percorre o funil → qualifica → marca horário (ou vai pro WhatsApp / time) → dá consentimento → vê a confirmação → botão `wa.me` com resumo.
3. O lead aparece **na hora** no Dashboard, em Leads e na Agenda do profissional, com resumo da IA.
4. No backoffice, a equipe vê o profissional, acompanha o setup assistido e os logs/pedidos de LGPD.

---

## Lista de funcionalidades

### App do profissional (Lado A)
- [x] Login / cadastro (Google ou e-mail), com toggle entrar/criar conta
- [x] Onboarding guiado em etapas com barra de progresso
- [x] Etapa de perfil enxuta (@ + uma frase)
- [x] **Objetivo inferido** da frase do perfil, sugerido com linguagem de benefício (Agendar / Qualificar-SDR / Capturar como alternativas)
- [x] Anexar **materiais pra IA** (PDFs e links) — simulado
- [x] **IA pergunta 1–2 coisas antes de gerar** (atende como? quando?) pra afinar as perguntas
- [x] Criação do funil **por IA** (gera mensagem + perguntas adaptadas ao objetivo e às respostas)
- [x] Criação do funil **manual** (builder de verdade, do zero)
- [x] Editor do funil: boas-vindas, perguntas (opções/texto livre), adicionar/remover/reordenar/ligar-desligar
- [x] Configuração de **dados de contato** (nome obrigatório; e-mail e WhatsApp opcionais; "quando pedir" só nos objetivos sem agenda)
- [x] **Aviso de lead novo** por e-mail e push (v1), com sino de avisos e banner no desktop
- [x] Conexão **Google Agenda** (fluxo de consentimento mockado, estado conectado)
- [x] Perfil do profissional (nome, foto, WhatsApp com máscara BR)
- [x] Publicação do funil + **link da bio** (copiar/compartilhar)
- [x] **Múltiplos funis** com **uso claro** (Bio do Instagram vs. campanha/stories), link próprio por funil e "usar na bio"
- [x] Dashboard com link da bio, métricas e últimos leads
- [x] Lista de **leads** com filtro por status e busca
- [x] **Master-detail** de leads no desktop
- [x] Detalhe do lead com **resumo da IA editável** (selo "editado por você", propaga p/ Dashboard, Leads e Detalhe), respostas, contato e consentimento
- [x] **Agenda** de próximos agendamentos agrupada por dia
- [x] **Automações do Instagram** (comentário → DM) com editor e **simulador ao vivo** *(Pro)*
- [x] Configurações (perfil, WhatsApp, agenda, texto LGPD editável, DPO)
- [x] Tela de **Planos** (Entrada, Pro/"Secretária", Setup assistido)
- [x] Visões **Celular e Desktop** do app, alternáveis

### Funil público (Lado B)
- [x] Experiência conversacional mobile, sem login
- [x] Boas-vindas personalizadas
- [x] Qualificação com **respostas rápidas** (toque) e indicador de progresso
- [x] Perguntas **adaptadas ao objetivo** do funil
- [x] **Agendamento como caminho primário** (vai direto aos horários, sem escape paralelo)
- [x] **Reserva provisória do horário por 10 min** com contagem regressiva, liberação automática e **"simular expiração"** na demo
- [x] **Contato em ponto fixo no modo Agendar** (após o slot, dentro da reserva)
- [x] **WhatsApp como fallback** ("Nenhum horário bom?"), não como opção paralela
- [x] **Captura de contato** configurável (nome, e-mail, WhatsApp) em cartão único, com validação
- [x] **Consentimento LGPD** obrigatório com aviso de privacidade dinâmico
- [x] Confirmação + **handoff via wa.me** com mensagem pré-preenchida
- [x] Três objetivos navegáveis: Agendar, Qualificar (SDR), Capturar

### Backoffice (Lado C)
- [x] Login interno restrito por papéis
- [x] Visão geral com métricas, alertas operacionais e gráfico de crescimento
- [x] Lista de **profissionais** com filtros e busca
- [x] Detalhe da conta com funil, leads, ações administrativas e auditoria
- [x] **Entrar como** (impersonar) com registro em log
- [x] **Kanban** de setups assistidos (done-for-you)
- [x] **Assinaturas** (planos, ciclos, status de pagamento)
- [x] **LGPD** (pedidos de titular, logs de consentimento, exclusão com dupla confirmação)
- [x] **Equipe interna** (papéis: Admin, Operação, Financeiro)

### Transversais
- [x] **Estado compartilhado ao vivo** entre os três lados (um lead do funil aparece no app e no backoffice)
- [x] **Mapa de telas** — índice navegável de tudo
- [x] Identidade visual própria (verde/teal, neutros quentes), mobile-first
- [x] **LGPD by design** (perguntas de logística, consentimento destacado, minimização de dados)
- [x] Estados de vazio amigáveis nas listas

---

## Anti-escopo (não incluído no v1)

Marcado como **"Em breve"** onde faz sentido, mas **não** construído:
- API oficial do WhatsApp / automação de disparo proativo e lembretes (v2 — tier "Secretária")
- Motor de agenda próprio (calendário completo, reagendamento, no-show)
- Cobrança de sinal via Pix / split de pagamento
- Gateway de pagamento real (telas de planos e assinaturas são estáticas/mock)
- CRM/pipeline/sequências e analytics "inteligente"
- Painel de clínica / multi-assento (o alvo do v1 é o profissional **solo**)

> A automação **comentário → DM** do Instagram foi incluída como **prévia do tier Pro**, marcada como "Recurso Pro" — para demonstrar a direção do produto sem promovê-la ao plano Entrada.
