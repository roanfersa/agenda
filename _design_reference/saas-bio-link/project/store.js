/* ===========================================================================
   store.js — shared live state for the bio-funil prototype
   Plain JS (no JSX). Loaded before the Babel scripts.
   A tiny observable store so a lead completed in the public funnel (Lado B)
   shows up instantly in the professional app (Lado A) and the backoffice (C).
   =========================================================================== */
(function () {
  const uid = (p) => p + '_' + Math.random().toString(36).slice(2, 9);

  // ---- Seed: the demo professional (Osvaldo) -----------------------------
  const osvaldo = {
    id: 'pro_osvaldo',
    nome: 'Osvaldo Reis',
    handleInstagram: '@osvaldo.terapia',
    especialidade: 'Terapeuta tântrico',
    atende: 'Online e presencial',
    fotoUrl: null, // initials fallback
    cor: '#0E8A6B',
    whatsapp: '5511998877665',
    googleCalendar: { conectado: true, email: 'osvaldo.reis@gmail.com', calendarId: 'Sessões — Osvaldo' },
    plano: 'entrada',
    avisos: { email: true, push: true }, // aviso de lead novo (v1)
    consentimentoTextoPadrao:
      'Autorizo Osvaldo Reis a tratar meus dados (nome e WhatsApp) para fins de agendamento e contato sobre o atendimento, conforme a LGPD. Posso revogar a qualquer momento.',
    criadoEm: '12/03/2026',
  };

  const osvaldoFunnel = {
    id: 'fnl_osvaldo',
    professionalId: 'pro_osvaldo',
    slug: 'osvaldo',
    nome: 'Primeira sessão',
    uso: 'Bio do Instagram',
    objetivo: 'agendar', // agendar | qualificar | capturar
    metodo: 'ia',        // ia | manual
    modo: 'ambos', // (legado) agendar | capturar | ambos
    camposContato: { email: true, whatsapp: true }, // nome é sempre coletado
    contatoQuando: 'fim', // inicio (após a 1ª pergunta) | fim
    contexto: [
      { id: 'ctx1', tipo: 'texto', label: 'Atendo ansiedade, burnout e autoconhecimento, online e presencial.' },
      { id: 'ctx2', tipo: 'pdf', label: 'tabela-de-precos.pdf' },
    ],
    mensagemBoasVindas:
      'Oi! Sou o Osvaldo 🌿 Me responde rapidinho pra eu entender como posso te ajudar e já deixar tudo pronto.',
    perguntas: [
      { id: 'q1', texto: 'O que te interessa?', tipo: 'opcoes', opcoes: ['Primeira sessão', 'Retorno', 'Só tirar uma dúvida'], obrigatoria: true },
      { id: 'q2', texto: 'Prefere como?', tipo: 'opcoes', opcoes: ['Online', 'Presencial'], obrigatoria: true },
      { id: 'q3', texto: 'Qual período é melhor pra você?', tipo: 'opcoes', opcoes: ['Manhã', 'Tarde', 'Noite'], obrigatoria: true },
    ],
    consentimentoTexto:
      'Autorizo Osvaldo Reis a tratar meus dados (nome e WhatsApp) para fins de agendamento e contato sobre o atendimento, conforme a LGPD. Posso revogar a qualquer momento.',
    status: 'publicado',
    criadoEm: '13/03/2026',
  };

  const osvaldoFunnel2 = {
    id: 'fnl_lista', professionalId: 'pro_osvaldo', slug: 'osvaldo-lista', nome: 'Lista de espera', uso: 'Campanha paga / Stories',
    objetivo: 'capturar', metodo: 'ia', modo: 'capturar', contexto: [],
    camposContato: { email: false, whatsapp: true }, contatoQuando: 'inicio',
    mensagemBoasVindas: 'Oi! No momento estou com a agenda cheia 🙏 Deixa seu contato que eu te aviso assim que abrir vaga.',
    perguntas: [
      { id: 'lq1', texto: 'O que te interessa?', tipo: 'opcoes', opcoes: ['Primeira sessão', 'Retorno'], obrigatoria: true },
      { id: 'lq2', texto: 'Qual o melhor horário pra falar?', tipo: 'opcoes', opcoes: ['Manhã', 'Tarde', 'Noite'], obrigatoria: true },
    ],
    consentimentoTexto:
      'Autorizo Osvaldo Reis a tratar meus dados (nome e WhatsApp) para entrar em contato sobre vagas, conforme a LGPD. Posso revogar a qualquer momento.',
    status: 'pausado',
    criadoEm: '02/06/2026',
  };

  // ---- Mock availability for the public funnel ---------------------------
  const disponibilidade = [
    { id: 'd0', rotulo: 'Seg 16', dia: 'Segunda, 16 jun', horarios: ['09:00', '11:00', '14:00', '15:00'] },
    { id: 'd1', rotulo: 'Ter 17', dia: 'Terça, 17 jun', horarios: ['10:00', '14:00', '16:00', '19:00'] },
    { id: 'd2', rotulo: 'Qua 18', dia: 'Quarta, 18 jun', horarios: ['08:00', '09:00', '18:00', '20:00'] },
    { id: 'd3', rotulo: 'Qui 19', dia: 'Quinta, 19 jun', horarios: ['11:00', '15:00', '17:00'] },
  ];

  // ---- Pre-seeded leads for Osvaldo --------------------------------------
  const leads = [
    {
      id: 'lead_1', professionalId: 'pro_osvaldo', funnelId: 'fnl_osvaldo',
      nome: 'Beatriz Almeida', whatsapp: '5511991234567', email: 'bia.almeida@gmail.com',
      respostas: [
        { perguntaId: 'q1', pergunta: 'O que te interessa?', valor: 'Primeira sessão' },
        { perguntaId: 'q2', pergunta: 'Prefere como?', valor: 'Online' },
        { perguntaId: 'q3', pergunta: 'Qual período é melhor?', valor: 'Tarde' },
      ],
      resumoIA: 'Quer uma primeira sessão, online, no período da tarde. Agendou para qui 19/06 às 15:00.',
      status: 'agendado', consentimento: { dado: true, dataHora: '12/06/2026 18:42' },
      origem: 'instagram', criadoEm: 'Ontem, 18:42', _t: 102,
    },
    {
      id: 'lead_2', professionalId: 'pro_osvaldo', funnelId: 'fnl_osvaldo',
      nome: 'Rafael Nunes', whatsapp: '5511987654321',
      respostas: [
        { perguntaId: 'q1', pergunta: 'O que te interessa?', valor: 'Retorno' },
        { perguntaId: 'q2', pergunta: 'Prefere como?', valor: 'Presencial' },
        { perguntaId: 'q3', pergunta: 'Qual período é melhor?', valor: 'Noite' },
      ],
      resumoIA: 'Paciente de retorno, prefere presencial à noite. Pediu pra continuar a conversa no WhatsApp.',
      status: 'em_conversa', consentimento: { dado: true, dataHora: '13/06/2026 09:05' },
      origem: 'link', criadoEm: 'Hoje, 09:05', _t: 200,
    },
    {
      id: 'lead_3', professionalId: 'pro_osvaldo', funnelId: 'fnl_osvaldo',
      nome: 'Carla Menezes', whatsapp: '5511996660001', email: 'carla.menezes@outlook.com',
      respostas: [
        { perguntaId: 'q1', pergunta: 'O que te interessa?', valor: 'Só tirar uma dúvida' },
        { perguntaId: 'q2', pergunta: 'Prefere como?', valor: 'Online' },
        { perguntaId: 'q3', pergunta: 'Qual período é melhor?', valor: 'Manhã' },
      ],
      resumoIA: 'Tem dúvidas antes de marcar. Interesse em online, de manhã. Ainda não agendou.',
      status: 'novo', consentimento: { dado: true, dataHora: '13/06/2026 08:11' },
      origem: 'instagram', criadoEm: 'Hoje, 08:11', _t: 150,
    },
  ];

  const appointments = [
    {
      id: 'apt_1', leadId: 'lead_1', professionalId: 'pro_osvaldo',
      diaRotulo: 'Quinta, 19 jun', dataHora: '19/06/2026 15:00', hora: '15:00',
      tipoAtendimento: 'Primeira sessão', modalidade: 'online', status: 'confirmado',
      googleEventId: 'evt_mock_1',
    },
  ];

  // ---- Other professionals (for the backoffice) --------------------------
  const otherPros = [
    { id: 'pro_maria', nome: 'Maria Lúcia Santos', handleInstagram: '@maria.psi', especialidade: 'Psicóloga', plano: 'pro', status: 'ativo', agenda: true, leads: 41, criadoEm: '02/02/2026' },
    { id: 'pro_juliana', nome: 'Juliana Ferraz', handleInstagram: '@dra.juferraz', especialidade: 'Dermatologista', plano: 'entrada', status: 'ativo', agenda: true, leads: 27, criadoEm: '21/03/2026' },
    { id: 'pro_thiago', nome: 'Thiago Barros', handleInstagram: '@thiago.fisio', especialidade: 'Fisioterapeuta', plano: 'entrada', status: 'trial', agenda: false, leads: 3, criadoEm: '08/06/2026' },
    { id: 'pro_renata', nome: 'Renata Aragão', handleInstagram: '@renata.estetica', especialidade: 'Esteticista', plano: 'entrada', status: 'inadimplente', agenda: true, leads: 18, criadoEm: '15/01/2026' },
    { id: 'pro_paulo', nome: 'Paulo Tavares', handleInstagram: '@nutri.paulo', especialidade: 'Nutricionista', plano: 'pro', status: 'ativo', agenda: true, leads: 63, criadoEm: '29/11/2025' },
    { id: 'pro_sandra', nome: 'Sandra Vidal', handleInstagram: '@sandra.terapias', especialidade: 'Terapeuta holística', plano: 'entrada', status: 'cancelado', agenda: false, leads: 9, criadoEm: '10/10/2025' },
  ];

  const subscriptions = [
    { id: 'sub_osvaldo', professionalId: 'pro_osvaldo', nome: 'Osvaldo Reis', plano: 'entrada', valor: 97, ciclo: 'mensal', proximoVencimento: '12/07/2026', status: 'em_dia' },
    { id: 'sub_maria', professionalId: 'pro_maria', nome: 'Maria Lúcia Santos', plano: 'pro', valor: 297, ciclo: 'mensal', proximoVencimento: '02/07/2026', status: 'em_dia' },
    { id: 'sub_juliana', professionalId: 'pro_juliana', nome: 'Juliana Ferraz', plano: 'entrada', valor: 97, ciclo: 'mensal', proximoVencimento: '21/06/2026', status: 'em_dia' },
    { id: 'sub_renata', professionalId: 'pro_renata', nome: 'Renata Aragão', plano: 'entrada', valor: 97, ciclo: 'mensal', proximoVencimento: '15/06/2026', status: 'atrasado' },
    { id: 'sub_paulo', professionalId: 'pro_paulo', nome: 'Paulo Tavares', plano: 'pro', valor: 297, ciclo: 'mensal', proximoVencimento: '29/06/2026', status: 'em_dia' },
    { id: 'sub_sandra', professionalId: 'pro_sandra', nome: 'Sandra Vidal', plano: 'entrada', valor: 97, ciclo: 'mensal', proximoVencimento: '10/05/2026', status: 'cancelado' },
    { id: 'sub_setup_thiago', professionalId: 'pro_thiago', nome: 'Thiago Barros', plano: 'setup', valor: 400, ciclo: 'unico', proximoVencimento: '—', status: 'em_dia' },
  ];

  const setups = [
    { id: 'st_1', professionalId: 'pro_thiago', nome: 'Thiago Barros', especialidade: 'Fisioterapeuta', responsavelId: 'iu_bruna', responsavel: 'Bruna L.', status: 'em_montagem', valor: 400, criadoEm: '09/06/2026' },
    { id: 'st_2', professionalId: 'pro_osvaldo', nome: 'Osvaldo Reis', especialidade: 'Terapeuta tântrico', responsavelId: 'iu_bruna', responsavel: 'Bruna L.', status: 'concluido', valor: 350, criadoEm: '12/03/2026' },
    { id: 'st_3', professionalId: 'pro_juliana', nome: 'Juliana Ferraz', especialidade: 'Dermatologista', responsavelId: 'iu_caio', responsavel: 'Caio M.', status: 'aguardando_cliente', valor: 500, criadoEm: '20/03/2026' },
    { id: 'st_4', professionalId: 'pro_lia', nome: 'Lia Prado', especialidade: 'Acupunturista', responsavelId: null, responsavel: '—', status: 'solicitado', valor: 400, criadoEm: '11/06/2026' },
    { id: 'st_5', professionalId: 'pro_marcos', nome: 'Marcos Dias', especialidade: 'Quiropraxista', responsavelId: 'iu_caio', responsavel: 'Caio M.', status: 'em_montagem', valor: 450, criadoEm: '10/06/2026' },
  ];

  const lgpdRequests = [
    { id: 'ds_1', leadNome: 'Felipe Castro', professionalNome: 'Maria Lúcia Santos', tipo: 'exclusao', status: 'pendente', prazo: '18/06/2026', criadoEm: '11/06/2026' },
    { id: 'ds_2', leadNome: 'Aline Souza', professionalNome: 'Paulo Tavares', tipo: 'acesso', status: 'pendente', prazo: '20/06/2026', criadoEm: '12/06/2026' },
    { id: 'ds_3', leadNome: 'Bruno Lima', professionalNome: 'Osvaldo Reis', tipo: 'correcao', status: 'concluido', prazo: '05/06/2026', criadoEm: '01/06/2026' },
  ];

  const consentLogs = [
    { id: 'cl_1', leadNome: 'Beatriz Almeida', professionalNome: 'Osvaldo Reis', dataHora: '12/06/2026 18:42', texto: osvaldoFunnel.consentimentoTexto },
    { id: 'cl_2', leadNome: 'Rafael Nunes', professionalNome: 'Osvaldo Reis', dataHora: '13/06/2026 09:05', texto: osvaldoFunnel.consentimentoTexto },
    { id: 'cl_3', leadNome: 'Aline Souza', professionalNome: 'Paulo Tavares', dataHora: '12/06/2026 14:20', texto: 'Autorizo Paulo Tavares a tratar meus dados…' },
  ];

  const internalUsers = [
    { id: 'iu_ana', nome: 'Ana Beatriz', email: 'ana@biofunil.com.br', papel: 'admin' },
    { id: 'iu_bruna', nome: 'Bruna Lemos', email: 'bruna@biofunil.com.br', papel: 'operacao' },
    { id: 'iu_caio', nome: 'Caio Martins', email: 'caio@biofunil.com.br', papel: 'operacao' },
    { id: 'iu_dora', nome: 'Dora Pinheiro', email: 'dora@biofunil.com.br', papel: 'financeiro' },
  ];

  const auditLog = [
    { id: 'al_1', internalUser: 'Ana Beatriz', acao: 'Entrou como Osvaldo Reis (suporte)', dataHora: '12/06/2026 16:30' },
    { id: 'al_2', internalUser: 'Dora Pinheiro', acao: 'Marcou cobrança de Renata Aragão como em análise', dataHora: '12/06/2026 11:12' },
    { id: 'al_3', internalUser: 'Bruna Lemos', acao: 'Concluiu setup assistido de Osvaldo Reis', dataHora: '13/03/2026 09:48' },
  ];

  // ---- Instagram automations (comment → DM) ----------------------------
  const automations = [
    {
      id: 'auto_1', ativa: true,
      postLegenda: '3 sinais de que sua ansiedade pede ajuda', postTipo: 'Reels', postEmoji: '\uD83C\uDF3F',
      keywords: ['QUERO', 'AJUDA'],
      respostaPublica: true, respostaPublicaTexto: 'Te chamei no direct! \uD83D\uDC9A',
      dmMensagem: 'Oi! Que bom que você se interessou \uD83C\uDF3F Separei aqui o link pra você responder 2 perguntinhas e já marcar sua primeira sessão comigo:',
      dmBotao: 'Marcar minha sessão',
      stats: { comentarios: 142, dms: 128, leads: 37 },
    },
    {
      id: 'auto_2', ativa: false,
      postLegenda: 'Carrossel: 5 práticas de autoconhecimento', postTipo: 'Carrossel', postEmoji: '\u2728',
      keywords: ['EBOOK'],
      respostaPublica: true, respostaPublicaTexto: 'Enviado no seu direct \uD83D\uDC8C',
      dmMensagem: 'Aqui está o material que prometi! E se quiser conversar sobre, é só tocar abaixo pra falar comigo \uD83D\uDE4F',
      dmBotao: 'Quero conversar',
      stats: { comentarios: 38, dms: 35, leads: 9 },
    },
  ];

  // ---- Initial state -----------------------------------------------------
  const initial = {
    professional: osvaldo,
    funnel: osvaldoFunnel,
    funnels: [osvaldoFunnel, osvaldoFunnel2],
    activeFunnelId: 'fnl_osvaldo',
    notifications: [
      { id: 'ntf_seed1', leadId: 'lead_3', nome: 'Carla Menezes', texto: 'entrou pelo seu funil', canais: 'e-mail + push', quando: 'Hoje, 08:11', lida: false },
    ],
    automations,
    disponibilidade,
    leads,
    appointments,
    otherPros,
    subscriptions,
    setups,
    lgpdRequests,
    consentLogs,
    internalUsers,
    auditLog,
    onboardingDone: true,   // Osvaldo is already set up; onboarding still navigable
    toast: null,
  };

  // ---- Observable --------------------------------------------------------
  const subs = new Set();
  let state = initial;
  function emit() { subs.forEach((f) => f()); }
  function setState(patch) {
    state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
    emit();
  }

  const Store = {
    getState: () => state,
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
    uid,

    // Public funnel completes → create lead (+ appointment if scheduled)
    addLeadFromFunnel({ nome, whatsapp, email, respostas, resumoIA, agendamento, origem = 'link', funnelId = 'fnl_osvaldo' }) {
      const leadId = uid('lead');
      const status = agendamento ? 'agendado' : 'novo';
      const lead = {
        id: leadId, professionalId: 'pro_osvaldo', funnelId,
        nome, whatsapp, email, respostas, resumoIA, status,
        consentimento: { dado: true, dataHora: '13/06/2026 ' + nowClock() },
        origem, criadoEm: 'Agora mesmo', _t: 999, _novo: true,
      };
      setState((s) => {
        const next = { ...s, leads: [lead, ...s.leads] };
        if (agendamento) {
          next.appointments = [
            ...s.appointments,
            {
              id: uid('apt'), leadId, professionalId: 'pro_osvaldo',
              diaRotulo: agendamento.dia, dataHora: agendamento.dataHora, hora: agendamento.hora,
              tipoAtendimento: agendamento.tipo, modalidade: agendamento.modalidade,
              status: 'confirmado', googleEventId: uid('evt'),
            },
          ];
        }
        next.consentLogs = [
          { id: uid('cl'), leadNome: nome, professionalNome: 'Osvaldo Reis', dataHora: lead.consentimento.dataHora, texto: s.funnel.consentimentoTexto },
          ...s.consentLogs,
        ];
        // aviso de lead novo (v1: e-mail + push) — loop fechado
        const canais = [s.professional.avisos?.email && 'e-mail', s.professional.avisos?.push && 'push'].filter(Boolean).join(' + ') || 'app';
        next.notifications = [
          { id: uid('ntf'), leadId, nome, texto: agendamento ? `marcou ${agendamento.dia}, ${agendamento.hora}` : 'entrou pelo seu funil', canais, quando: 'Agora mesmo', lida: false },
          ...s.notifications,
        ];
        return next;
      });
      // toast simulando o push/e-mail chegando
      Store.toast(`🔔 Lead novo: ${nome.split(' ')[0]}`);
      return leadId;
    },

    markNotifsRead() { setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, lida: true })) })); },
    toggleAviso(key) { setState((s) => ({ ...s, professional: { ...s.professional, avisos: { ...s.professional.avisos, [key]: !s.professional.avisos[key] } } })); },

    toggleAutomation(id) { setState((s) => ({ ...s, automations: s.automations.map((a) => a.id === id ? { ...a, ativa: !a.ativa } : a) })); },
    saveAutomation(rule) {
      setState((s) => {
        const exists = s.automations.some((a) => a.id === rule.id);
        return { ...s, automations: exists ? s.automations.map((a) => a.id === rule.id ? rule : a) : [{ ...rule, id: uid('auto') }, ...s.automations] };
      });
    },
    // simulate a captured comment: bump stats + create a lead from the DM funnel
    captureComment(autoId, comentarista) {
      setState((s) => ({
        ...s,
        automations: s.automations.map((a) => a.id === autoId ? { ...a, stats: { ...a.stats, comentarios: a.stats.comentarios + 1, dms: a.stats.dms + 1 } } : a),
      }));
    },

    updateFunnel(patch) { setState((s) => { const funnel = { ...s.funnel, ...patch }; return { ...s, funnel, funnels: s.funnels.map((f) => f.id === funnel.id ? funnel : f) }; }); },
    setActiveFunnel(id) { setState((s) => ({ ...s, activeFunnelId: id, funnel: s.funnels.find((f) => f.id === id) || s.funnel })); },
    addFunnel(f) {
      const funnel = { id: uid('fnl'), professionalId: 'pro_osvaldo', status: 'publicado', criadoEm: 'Hoje', contexto: [], camposContato: { email: true, whatsapp: true }, contatoQuando: 'fim', uso: 'Outro', ...f, slug: f.slug || ('osvaldo-' + Math.random().toString(36).slice(2, 6)) };
      setState((s) => ({ ...s, funnels: [...s.funnels, funnel], funnel, activeFunnelId: funnel.id }));
      return funnel.id;
    },
    toggleFunnelStatus(id) { setState((s) => ({ ...s, funnels: s.funnels.map((f) => f.id === id ? { ...f, status: f.status === 'publicado' ? 'pausado' : 'publicado' } : f) })); },
    updateLead(id, patch) { setState((s) => ({ ...s, leads: s.leads.map((l) => l.id === id ? { ...l, ...patch } : l) })); },
    deleteFunnel(id) {
      setState((s) => { const funnels = s.funnels.filter((f) => f.id !== id); const active = s.activeFunnelId === id ? funnels[0] : s.funnel; return { ...s, funnels, activeFunnelId: active?.id, funnel: active }; });
    },
    updateProfessional(patch) { setState((s) => ({ ...s, professional: { ...s.professional, ...patch } })); },
    connectCalendar(email) {
      setState((s) => ({ ...s, professional: { ...s.professional, googleCalendar: { conectado: true, email: email || s.professional.googleCalendar.email, calendarId: s.professional.googleCalendar.calendarId } } }));
    },
    disconnectCalendar() {
      setState((s) => ({ ...s, professional: { ...s.professional, googleCalendar: { ...s.professional.googleCalendar, conectado: false } } }));
    },
    markLeadRead(id) {
      setState((s) => ({ ...s, leads: s.leads.map((l) => l.id === id ? { ...l, _novo: false } : l) }));
    },
    resolveLgpd(id) {
      setState((s) => ({ ...s, lgpdRequests: s.lgpdRequests.map((r) => r.id === id ? { ...r, status: 'concluido' } : r) }));
    },
    advanceSetup(id, status) {
      setState((s) => ({ ...s, setups: s.setups.map((t) => t.id === id ? { ...t, status } : t) }));
    },
    toast(msg) {
      setState({ toast: { id: uid('t'), msg } });
      setTimeout(() => setState((s) => (s.toast && s.toast.msg === msg ? { ...s, toast: null } : s)), 2600);
    },
  };

  function nowClock() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  // Derived helpers
  Store.leadsFor = (pid) => state.leads.filter((l) => l.professionalId === pid);
  Store.apptFor = (pid) => state.appointments.filter((a) => a.professionalId === pid);
  Store.leadById = (id) => state.leads.find((l) => l.id === id);
  Store.apptByLead = (id) => state.appointments.find((a) => a.leadId === id);

  window.Store = Store;
})();

/* ---- Objetivos do funil (fonte única de verdade) ----------------------- */
window.OBJETIVOS = [
  { id: 'agendar', icon: 'calendar', titulo: 'Agendar', curto: 'Agendar', beneficio: 'Encher a agenda com horários marcados', desc: 'A pessoa sai com o horário marcado.', exemplo: 'Consultas, sessões, avaliações', cta: 'Marcar horário', sched: true },
  { id: 'qualificar', icon: 'target', titulo: 'Qualificar pra vender (SDR)', curto: 'SDR', beneficio: 'Falar só com quem tá pronto pra fechar', desc: 'Filtra e encaminha o lead quente pro time de vendas.', exemplo: 'Serviços, B2B, alto ticket', cta: 'Falar com o time', sched: false },
  { id: 'capturar', icon: 'whatsapp', titulo: 'Capturar contato', curto: 'Capturar', beneficio: 'Pegar o contato pra não perder ninguém', desc: 'Pega o contato e continua a conversa no WhatsApp.', exemplo: 'Dúvidas, lista de interesse', cta: 'Falar no WhatsApp', sched: false },
];
window.OBJ = (id) => window.OBJETIVOS.find((o) => o.id === id) || window.OBJETIVOS[0];
// Infere o objetivo a partir da frase do profissional na Etapa 1
window.inferObjetivo = (texto) => {
  const t = (texto || '').toLowerCase();
  if (/(atend|paciente|consulta|sessão|sessao|terapia|psic|clínic|clinic|estétic|estetic|massag|fisio|nutri|odonto|dentista|médic|medic|avaliaç|consultório)/.test(t)) return 'agendar';
  if (/(vend|venda|orçament|orcament|consultoria|serviço|servico|b2b|empresa|projeto|orç|fech)/.test(t)) return 'qualificar';
  return 'capturar';
};
