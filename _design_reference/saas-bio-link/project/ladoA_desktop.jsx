/* ===========================================================================
   ladoA_desktop.jsx — App do profissional, versão desktop (web app)
   Reaproveita store + componentes; layout largo com barra lateral.
   =========================================================================== */

function ProDeskShell({ screen, setScreen, store, children }) {
  const nav = [
    { id: 'inicio', label: 'Início', icon: 'home' },
    { id: 'leads', label: 'Leads', icon: 'users' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar' },
    { id: 'funil', label: 'Funis', icon: 'funnel' },
    { id: 'automacoes', label: 'Automações', icon: 'instagram' },
    { id: 'planos', label: 'Planos', icon: 'bolt' },
    { id: 'config', label: 'Ajustes', icon: 'settings' },
  ];
  const novos = store.leads.filter((l) => l._novo || l.status === 'novo').length;
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#222B26', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 1320, height: 'calc(100vh - 56px - 48px)', minHeight: 620, background: 'var(--bg)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,.2)' }}>
        {/* browser chrome */}
        <div style={{ height: 44, background: '#EDEAE3', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 7 }}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}</div>
          <div style={{ flex: 1, maxWidth: 460, height: 26, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px', fontSize: 12.5, color: 'var(--muted)', margin: '0 auto', fontWeight: 600 }}>
            <Icon name="lock" size={12} /> app.agendai.com.br/{screen === 'inicio' ? 'inicio' : screen}
          </div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* sidebar — light/brand */}
          <div style={{ width: 244, background: 'var(--card)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '18px 14px' }}>
            <div style={{ padding: '0 8px 18px' }}><Logo size={25} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nav.map((n) => {
                const on = screen === n.id;
                return (
                  <button key={n.id} onClick={() => setScreen(n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                    fontSize: 14, fontWeight: on ? 700 : 600, transition: 'all .14s',
                    background: on ? 'var(--accent-050)' : 'transparent', color: on ? 'var(--accent-800)' : 'var(--muted)',
                  }}>
                    <Icon name={n.icon} size={19} sw={on ? 2.1 : 1.8} />{n.label}
                    {n.id === 'leads' && novos ? <span style={{ marginLeft: 'auto', minWidth: 19, height: 19, padding: '0 5px', borderRadius: 10, background: 'var(--danger)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{novos}</span> : null}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 16, padding: '0 4px' }}>
              <BioLinkCard slug={store.funnel.slug} />
            </div>
            <div style={{ marginTop: 'auto', padding: 8, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)' }}>
              <Avatar name={store.professional.nome} size={34} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.professional.nome}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Plano Entrada</div>
              </div>
            </div>
          </div>
          {/* content */}
          <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }} className="no-sb">
            <div style={{ padding: '26px 30px 44px' }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LadoADesktop({ start = 'inicio' }) {
  const store = useStore();
  const [screen, setScreen] = React.useState(['inicio', 'leads', 'agenda', 'funil', 'config', 'planos', 'automacoes'].includes(start) ? start : 'inicio');
  const [leadId, setLeadId] = React.useState(store.leads[0]?.id);
  const openLead = (id) => { setLeadId(id); Store.markLeadRead(id); setScreen('leads'); };

  let content;
  if (screen === 'inicio') content = <DeskDashboard store={store} openLead={openLead} go={setScreen} />;
  else if (screen === 'leads') content = <DeskLeads store={store} leadId={leadId} setLeadId={(id) => { setLeadId(id); Store.markLeadRead(id); }} go={setScreen} />;
  else if (screen === 'agenda') content = <DeskAgenda store={store} openLead={openLead} />;
  else if (screen === 'funil') content = <FunisList store={store} onEdit={() => setScreen('funilEdit')} onNew={() => { Store.addFunnel({ nome: 'Novo funil', objetivo: 'agendar', metodo: 'manual', modo: 'ambos', mensagemBoasVindas: 'Oi! Que bom que você chegou aqui 🙌 Responde rapidinho pra eu te ajudar melhor.', perguntas: [{ id: 'q' + Date.now(), texto: 'Sua primeira pergunta', tipo: 'opcoes', opcoes: ['Opção 1', 'Opção 2'], obrigatoria: false }], consentimentoTexto: store.professional.consentimentoTextoPadrao }); setScreen('funilEdit'); }} />;
  else if (screen === 'funilEdit') content = <DeskFunil store={store} onBack={() => setScreen('funil')} />;
  else if (screen === 'automacoes') content = <InstaAutomacoes />;
  else if (screen === 'planos') content = <DeskPlanos store={store} />;
  else if (screen === 'config') content = <div style={{ maxWidth: 660 }}><PageHead title="Ajustes" sub="Perfil, integrações e privacidade" /><ConfigScreen store={store} go={setScreen} /></div>;

  return <ProDeskShell screen={screen === 'funilEdit' ? 'funil' : screen} setScreen={setScreen} store={store}>{content}</ProDeskShell>;
}

/* ---- Dashboard desktop --------------------------------------------------- */
function DeskDashboard({ store, openLead, go }) {
  const novos = store.leads.filter((l) => l._novo || l.status === 'novo').length;
  const recent = store.leads.slice(0, 5);
  const appts = [...store.appointments].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const naoLidas = store.notifications.filter((n) => !n.lida).length;
  return (
    <div>
      <PageHead title={`Oi, ${store.professional.nome.split(' ')[0]} 👋`} sub="Sexta, 13 de junho de 2026" />
      {naoLidas > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--accent-050)', border: '1px solid var(--accent-100)', borderRadius: 14, padding: '12px 16px', marginBottom: 18 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="bell" size={19} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14.5 }}>{naoLidas} {naoLidas > 1 ? 'leads novos entraram' : 'lead novo entrou'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Você foi avisado por e-mail e push — sem precisar ficar de olho no app.</div>
          </div>
          <Button size="sm" variant="soft" onClick={() => { Store.markNotifsRead(); go('leads'); }}>Ver leads</Button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        <Metric icon="bell" value={novos} label="Leads novos" tone="accent" />
        <Metric icon="calendar" value={store.appointments.length} label="Agendamentos" tone="info" />
        <Metric icon="users" value={store.leads.length} label="Leads na semana" tone="amber" />
        <Metric icon="chat" value="68%" label="Taxa de qualificação" tone="ink" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'start' }}>
        <DeskCard pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line-soft)' }}>
            <h3 style={{ fontSize: 16 }}>Últimos leads</h3>
            <button onClick={() => go('leads')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Ver todos</button>
          </div>
          <div style={{ padding: '4px 12px' }}>
            {recent.map((l, i) => (
              <React.Fragment key={l.id}>
                {i > 0 && <div style={{ height: 1, background: 'var(--line-soft)', margin: '0 8px' }} />}
                <LeadRow lead={l} onClick={() => openLead(l.id)} compact />
              </React.Fragment>
            ))}
          </div>
        </DeskCard>
        <DeskCard pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-soft)' }}><h3 style={{ fontSize: 16 }}>Próximos agendamentos</h3></div>
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appts.length ? appts.map((a) => {
              const lead = store.leads.find((l) => l.id === a.leadId);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'var(--bg)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--accent)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, opacity: .85, textTransform: 'uppercase' }}>{a.diaRotulo.split(',')[1]?.trim().split(' ')[1]}</span>
                    <span style={{ fontSize: 17, fontWeight: 800 }}>{a.diaRotulo.split(',')[1]?.trim().split(' ')[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{lead?.nome}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{a.hora} · {a.tipoAtendimento}</div>
                  </div>
                </div>
              );
            }) : <EmptyState icon="calendar" title="Agenda livre" body="Os agendamentos do funil aparecem aqui." />}
          </div>
        </DeskCard>
      </div>
    </div>
  );
}

/* ---- Leads desktop (master-detail) -------------------------------------- */
function DeskLeads({ store, leadId, setLeadId, go }) {
  const [filter, setFilter] = React.useState('todos');
  const [q, setQ] = React.useState('');
  const filters = [['todos', 'Todos'], ['novo', 'Novos'], ['agendado', 'Agendados'], ['em_conversa', 'Em conversa']];
  let list = store.leads;
  if (filter !== 'todos') list = list.filter((l) => l.status === filter);
  if (q.trim()) list = list.filter((l) => l.nome.toLowerCase().includes(q.toLowerCase()));
  const lead = store.leads.find((l) => l.id === leadId) || list[0];

  return (
    <div>
      <PageHead title="Leads" sub={`${store.leads.length} no total · seu histórico mora aqui`} />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 18, alignItems: 'start' }}>
        <DeskCard pad={0}>
          <div style={{ padding: 14, borderBottom: '1px solid var(--line-soft)' }}>
            <Field placeholder="Buscar por nome" icon="search" value={q} onChange={setQ} />
            <div style={{ display: 'flex', gap: 7, marginTop: 11, flexWrap: 'wrap' }}>
              {filters.map(([id, l]) => { const on = filter === id; return <button key={id} onClick={() => setFilter(id)} style={{ padding: '7px 12px', borderRadius: 18, fontSize: 12.5, fontWeight: 700, background: on ? 'var(--ink)' : 'var(--bg)', color: on ? '#fff' : 'var(--muted)', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}` }}>{l}</button>; })}
            </div>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto', padding: '4px 10px' }} className="no-sb">
            {list.length ? list.map((l, i) => {
              const on = lead && l.id === lead.id;
              return (
                <div key={l.id} onClick={() => setLeadId(l.id)} style={{ borderRadius: 12, background: on ? 'var(--accent-050)' : 'transparent', transition: 'background .12s', cursor: 'pointer', borderTop: i > 0 && !on ? '1px solid var(--line-soft)' : '1px solid transparent' }}>
                  <div style={{ padding: '0 6px' }}><LeadRow lead={l} onClick={() => setLeadId(l.id)} compact /></div>
                </div>
              );
            }) : <EmptyState icon="users" title="Nada por aqui" body="Nenhum lead com esse filtro." />}
          </div>
        </DeskCard>
        <DeskCard>
          {lead ? <DeskLeadDetail lead={lead} store={store} go={go} /> : <EmptyState icon="users" title="Selecione um lead" body="Escolha alguém na lista pra ver o resumo." />}
        </DeskCard>
      </div>
    </div>
  );
}

function DeskLeadDetail({ lead, store, go }) {
  const appt = store.appointments.find((a) => a.leadId === lead.id);
  const waMsg = `Oi ${lead.nome.split(' ')[0]}! Aqui é o ${store.professional.nome.split(' ')[0]}. Recebi seu contato pelo link 🌿`;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <Avatar name={lead.nome} size={54} bg="var(--accent-100)" fg="var(--accent-800)" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><h2 style={{ fontSize: 21 }}>{lead.nome}</h2><Badge status={lead.status} /></div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 2 }}>{[lead.whatsapp && fmtWhats(lead.whatsapp), lead.email].filter(Boolean).join(' · ')} · entrou {lead.criadoEm.toLowerCase()}</div>
        </div>
        {lead.whatsapp
          ? <a href={waLink(lead.whatsapp, waMsg)} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}><Button variant="whats" icon="whatsapp">Abrir no WhatsApp</Button></a>
          : lead.email ? <a href={`mailto:${lead.email}`} style={{ textDecoration: 'none' }}><Button variant="dark" icon="chat">Enviar e-mail</Button></a> : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18, alignItems: 'start' }}>
        <div>
          <ResumoIA lead={lead} desk />
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg)', borderRadius: 12, padding: '11px 14px', marginTop: 14 }}>
            <span style={{ color: 'var(--accent)' }}><Icon name="shield" size={17} /></span><span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>Consentimento em {lead.consentimento.dataHora}</span>
          </div>
        </div>
        <div>
          {appt && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel style={{ marginBottom: 8 }}>Agendamento</SectionLabel>
              <div onClick={() => go('agenda')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid var(--accent-200)', borderRadius: 14, padding: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--accent)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, opacity: .85 }}>{appt.diaRotulo.split(',')[1]?.trim().split(' ')[1]}</span>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{appt.diaRotulo.split(',')[1]?.trim().split(' ')[0]}</span>
                </div>
                <div><div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{appt.diaRotulo}, {appt.hora}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><Icon name={appt.modalidade === 'online' ? 'video' : 'mappin'} size={13} /> {appt.modalidade === 'online' ? 'Online' : 'Presencial'}</div></div>
              </div>
            </div>
          )}
          <SectionLabel style={{ marginBottom: 8 }}>Respostas do funil</SectionLabel>
          <div style={{ border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
            {lead.respostas.map((r, i) => (
              <div key={i} style={{ padding: '11px 14px', borderTop: i > 0 ? '1px solid var(--line-soft)' : 'none' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3 }}>{r.pergunta}</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{r.valor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Agenda desktop ------------------------------------------------------ */
function DeskAgenda({ store, openLead }) {
  const appts = [...store.appointments].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const groups = {}; appts.forEach((a) => { (groups[a.diaRotulo] = groups[a.diaRotulo] || []).push(a); });
  return (
    <div style={{ maxWidth: 760 }}>
      <PageHead title="Agenda" sub="Próximos atendimentos" action={<Badge bg="var(--accent-050)" fg="var(--accent-800)"><Icon name="google" size={14} /> {store.professional.googleCalendar.calendarId}</Badge>} />
      {appts.length ? Object.keys(groups).map((k) => (
        <div key={k} style={{ marginBottom: 22 }}>
          <SectionLabel style={{ marginBottom: 10 }}>{k}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups[k].map((a) => {
              const lead = store.leads.find((l) => l.id === a.leadId);
              return (
                <DeskCard key={a.id} pad={16} style={{ cursor: 'pointer' }}>
                  <div onClick={() => lead && openLead(lead.id)} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--accent)', width: 60 }}>{a.hora}</div>
                    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
                    <Avatar name={lead?.nome} size={40} bg="var(--accent-100)" fg="var(--accent-800)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{lead?.nome}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><Icon name={a.modalidade === 'online' ? 'video' : 'mappin'} size={14} /> {a.tipoAtendimento} · {a.modalidade === 'online' ? 'Online' : 'Presencial'}</div>
                    </div>
                    <Badge status="agendado">Confirmado</Badge>
                  </div>
                </DeskCard>
              );
            })}
          </div>
        </div>
      )) : <DeskCard><EmptyState icon="calendar" title="Agenda livre" body="Quando alguém marcar pelo funil, aparece aqui." /></DeskCard>}
    </div>
  );
}

/* ---- Funil desktop (editor + preview) ------------------------------------ */
function DeskFunil({ store, onBack }) {
  const [welcome, setWelcome] = React.useState(store.funnel.mensagemBoasVindas);
  const [questions, setQuestions] = React.useState(store.funnel.perguntas.map((q) => ({ ...q, ativa: true })));
  const [objetivo, setObjetivo] = React.useState(store.funnel.objetivo || 'agendar');
  const [consent, setConsent] = React.useState(store.funnel.consentimentoTexto);
  const [campos, setCampos] = React.useState(store.funnel.camposContato || { email: true, whatsapp: true });
  const [quando, setQuando] = React.useState(store.funnel.contatoQuando || 'fim');
  const setQ = (i, patch) => setQuestions((qs) => qs.map((x, j) => j === i ? { ...x, ...patch } : x));
  const addQ = () => setQuestions((qs) => [...qs, { id: 'q' + Date.now(), texto: 'Nova pergunta', tipo: 'opcoes', opcoes: ['Opção 1', 'Opção 2'], obrigatoria: false, ativa: true }]);
  const rmQ = (i) => setQuestions((qs) => qs.filter((_, j) => j !== i));
  const save = () => { Store.updateFunnel({ objetivo, modo: objetivo === 'agendar' ? 'ambos' : 'capturar', mensagemBoasVindas: welcome, consentimentoTexto: consent, camposContato: campos, contatoQuando: quando, perguntas: questions.filter((q) => q.ativa).map(({ ativa, ...q }) => q) }); Store.toast('Funil republicado ✓'); };
  const previewFunnel = { ...store.funnel, objetivo, mensagemBoasVindas: welcome, perguntas: questions.filter((q) => q.ativa) };
  return (
    <div>
      {onBack && <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 14 }}><Icon name="arrowLeft" size={16} /> Funis</button>}
      <PageHead title={`Editar · ${store.funnel.nome}`} sub="Ajuste o objetivo, as mensagens e as perguntas. Salve pra republicar." action={<Button icon="refresh" onClick={save}>Salvar e republicar</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <DeskCard>
            <SectionLabel style={{ marginBottom: 10 }}>Objetivo do funil</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {OBJETIVOS.map((m) => { const on = objetivo === m.id; return <button key={m.id} onClick={() => setObjetivo(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '12px 12px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: on ? 'var(--accent-050)' : 'var(--bg)', color: on ? 'var(--accent-800)' : 'var(--muted)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}` }}><Icon name={m.icon} size={18} />{m.titulo}</button>; })}
            </div>
          </DeskCard>
          <DeskCard>
            <SectionLabel style={{ marginBottom: 10 }}>Mensagem de boas-vindas</SectionLabel>
            <EditableBlock value={welcome} onChange={setWelcome} multiline />
            <SectionLabel style={{ margin: '20px 0 10px' }}>Perguntas de qualificação</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions.map((q, i) => (
                <QuestionEditor key={q.id} q={q} onChange={(patch) => setQ(i, patch)} onRemove={questions.length > 1 ? () => rmQ(i) : null} />
              ))}
            </div>
            <button onClick={addQ} style={{ marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 12, border: '1.5px dashed var(--accent-200)', color: 'var(--accent-800)', background: 'var(--accent-050)', fontWeight: 700, fontSize: 14 }}><Icon name="plus" size={17} /> Adicionar pergunta</button>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderRadius: 12, border: '1px dashed var(--line)', background: 'var(--bg)' }}>
              <span style={{ color: 'var(--accent)' }}><Icon name="shield" size={17} /></span><span style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>Pergunte só o necessário pra rotear — nada sensível (LGPD).</span>
            </div>
          </DeskCard>
          <DeskCard>
            <SectionLabel style={{ marginBottom: 10 }}>Dados de contato</SectionLabel>
            <ContactConfig campos={campos} setCampos={setCampos} quando={quando} setQuando={setQuando} objetivo={objetivo} />
          </DeskCard>
          <DeskCard>
            <SectionLabel style={{ marginBottom: 10 }}>Texto de consentimento (LGPD)</SectionLabel>
            <EditableBlock value={consent} onChange={setConsent} multiline />
          </DeskCard>
        </div>
        <div style={{ position: 'sticky', top: 0 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Prévia · como o lead vê</SectionLabel>
          <FunnelPreview funnel={previewFunnel} pro={store.professional} />
        </div>
      </div>
    </div>
  );
}

/* ---- Planos desktop ------------------------------------------------------ */
function DeskPlanos({ store }) {
  const planos = [
    { id: 'entrada', nome: 'Entrada', preco: 'R$97', periodo: '/mês', atual: store.professional.plano === 'entrada', features: ['Bio-funil + qualificação', 'Agendamento no fluxo', 'Resumo do lead no WhatsApp', 'Leads e agenda ilimitados'] },
    { id: 'pro', nome: 'Pro · "Secretária"', preco: 'R$297', periodo: '/mês', soon: true, destaque: true, features: ['Tudo do Entrada', 'Automação de WhatsApp', 'Comment → DM do Instagram', 'Follow-up e lembrete por IA', 'Reagendamento e multi-atendente'] },
    { id: 'setup', nome: 'Setup assistido', preco: 'R$300–500', periodo: 'única vez', features: ['A gente monta seu funil pra você', 'Sessão de configuração', 'Funil pronto pra publicar'] },
  ];
  return (
    <div>
      <PageHead title="Planos" />
      <div style={{ background: 'var(--ink)', borderRadius: 16, padding: '18px 22px', color: '#fff', display: 'flex', alignItems: 'center', gap: 13, marginBottom: 22, maxWidth: 980 }}>
        <span style={{ color: 'var(--accent-200)' }}><Icon name="bolt" size={24} /></span>
        <div><div style={{ fontWeight: 700, fontSize: 16 }}>Uma secretária custa R$1.500+/mês.</div><div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>O Agendaí faz o filtro e marca por você.</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, maxWidth: 980, alignItems: 'start' }}>
        {planos.map((p) => (
          <div key={p.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', border: `2px solid ${p.destaque ? 'var(--accent)' : 'var(--line)'}`, padding: 22, position: 'relative', boxShadow: p.destaque ? 'var(--sh)' : 'var(--sh-sm)' }}>
            {p.soon && <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 11, fontWeight: 800, color: 'var(--amber-ink)', background: 'var(--amber-bg)', padding: '4px 9px', borderRadius: 8 }}>EM BREVE</span>}
            {p.atual && <span style={{ position: 'absolute', top: 18, right: 18, fontSize: 11, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-100)', padding: '4px 9px', borderRadius: 8 }}>SEU PLANO</span>}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>{p.nome}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 0 18px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--ink)', letterSpacing: '-.02em' }}>{p.preco}</span>
              <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>{p.periodo}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {p.features.map((f, i) => <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.35 }}><span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}><Icon name="check" size={16} sw={2.5} /></span>{f}</div>)}
            </div>
            <Button full variant={p.atual ? 'soft' : p.soon ? 'outline' : p.destaque ? 'primary' : 'dark'} disabled={p.atual} onClick={() => Store.toast(p.soon ? 'Avisaremos quando chegar!' : 'Plano selecionado (mock)')}>
              {p.atual ? 'Plano atual' : p.soon ? 'Quero saber quando chegar' : p.id === 'setup' ? 'Quero o setup' : 'Assinar'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LadoADesktop, ProDeskShell, DeskDashboard, DeskLeads, DeskLeadDetail, DeskAgenda, DeskFunil, DeskPlanos });
