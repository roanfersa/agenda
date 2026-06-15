/* ===========================================================================
   ladoA_app.jsx — App do profissional: login + screens + tab navigation
   =========================================================================== */

function LadoA({ start = 'inicio' }) {
  const [screen, setScreen] = React.useState(start);
  const [leadId, setLeadId] = React.useState(null);
  const [onbNovo, setOnbNovo] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const store = useStore();

  const openLead = (id) => { setLeadId(id); Store.markLeadRead(id); setScreen('leadDetail'); };
  React.useEffect(() => { if (start === 'leadDetail' && !leadId) setLeadId(store.leads[0]?.id); }, []);

  if (screen === 'entrar') return <LoginScreen onLogin={() => setScreen('inicio')} onSignup={() => { setOnbNovo(false); setScreen('onboarding'); }} />;
  if (screen === 'onboarding') return <LadoAOnboarding novoFunil={onbNovo} onDone={() => setScreen(onbNovo ? 'funis' : 'inicio')} onExit={() => setScreen(onbNovo ? 'funis' : 'entrar')} />;

  const isMain = ['inicio', 'leads', 'agenda', 'config'].includes(screen);
  const novos = store.leads.filter((l) => l._novo || l.status === 'novo').length;
  const naoLidas = store.notifications.filter((n) => !n.lida).length;
  const tabbar = isMain ? <TabBar active={screen} onChange={setScreen} badge={novos || null} /> : null;
  const openNotifs = () => { setNotifOpen(true); Store.markNotifsRead(); };

  let header, body, statusDark = false, safeBg = 'var(--card)', bg = 'var(--bg)';

  if (screen === 'inicio') {
    header = <AppHeader title={`Oi, ${store.professional.nome.split(' ')[0]} 👋`} sub="Aqui está o seu dia"
      right={<RoundBtn icon="bell" badge={naoLidas || null} onClick={openNotifs} />} />;
    body = <Dashboard store={store} openLead={openLead} go={setScreen} />;
  } else if (screen === 'leads') {
    header = <AppHeader title="Leads" sub={`${store.leads.length} no total`} />;
    body = <LeadsScreen store={store} openLead={openLead} />;
  } else if (screen === 'agenda') {
    header = <AppHeader title="Agenda" sub="Próximos atendimentos" />;
    body = <AgendaScreen store={store} openLead={openLead} />;
  } else if (screen === 'config') {
    header = <AppHeader title="Ajustes" />;
    body = <ConfigScreen store={store} go={setScreen} />;
  } else if (screen === 'leadDetail') {
    const lead = store.leads.find((l) => l.id === leadId) || store.leads[0];
    header = <PushHeader title="Lead" onBack={() => setScreen('leads')} />;
    body = <LeadDetail lead={lead} store={store} go={setScreen} />;
  } else if (screen === 'funis') {
    header = <PushHeader title="Funis" onBack={() => setScreen('config')} right={<RoundBtn icon="plus" onClick={() => { setOnbNovo(true); setScreen('onboarding'); }} />} />;
    body = <FunisList store={store} compact onEdit={() => setScreen('funil')} onNew={() => { setOnbNovo(true); setScreen('onboarding'); }} />; bg = 'var(--bg)';
  } else if (screen === 'funil') {
    header = <PushHeader title="Editar funil" onBack={() => setScreen('funis')} />;
    body = <FunilScreen store={store} onSaved={() => setScreen('funis')} />;
  } else if (screen === 'planos') {
    header = <PushHeader title="Planos" onBack={() => setScreen('config')} />;
    body = <PlanosScreen store={store} />; bg = 'var(--bg)';
  } else if (screen === 'automacoes') {
    header = <PushHeader title="Automações" onBack={() => setScreen('config')} />;
    body = <InstaAutomacoes compact />; bg = 'var(--bg)';
  }

  return (
    <Phone header={header} tabbar={tabbar} statusDark={statusDark} safeBg={safeBg} bg={bg}>
      {body}
      {notifOpen && <NotificationsSheet store={store} onClose={() => setNotifOpen(false)} onOpen={(id) => { setNotifOpen(false); openLead(id); }} />}
    </Phone>
  );
}

/* ---- notifications sheet (aviso de lead novo · v1) ---------------------- */
function NotificationsSheet({ store, onClose, onOpen }) {
  const ntfs = store.notifications;
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(21,33,28,.42)', display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .2s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg)', borderRadius: '24px 24px 0 0', padding: '18px 18px 30px', width: '100%', animation: 'slideUp .3s cubic-bezier(.2,.8,.3,1) both', maxHeight: '76%', overflowY: 'auto' }} className="no-sb">
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--line)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="bell" size={20} /></span>
          <h3 style={{ fontSize: 18 }}>Avisos</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.45 }}>Você é avisado por <b>e-mail e push</b> quando entra um lead — sem precisar ficar olhando o app.</p>
        {ntfs.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {ntfs.map((n) => (
              <button key={n.id} onClick={() => onOpen(n.leadId)} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 13 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="user" size={19} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--ink)', fontSize: 14.5 }}>{n.nome} {n.texto}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    <span>{n.quando}</span><span>·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="send" size={11} /> {n.canais}</span>
                  </span>
                </span>
                <span style={{ color: 'var(--faint)' }}><Icon name="chevRight" size={17} /></span>
              </button>
            ))}
          </div>
        ) : <EmptyState icon="bell" title="Nenhum aviso ainda" body="Quando alguém entrar pelo seu funil, o aviso aparece aqui." />}
      </div>
    </div>
  );
}

function PushHeader({ title, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px 14px' }}>
      <RoundBtn icon="arrowLeft" onClick={onBack} />
      <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--ink)', letterSpacing: '-.02em' }}>{title}</div>
      {right}
    </div>
  );
}

/* ===========================================================================
   LOGIN
   =========================================================================== */
function LoginScreen({ onLogin, onSignup }) {
  const [tab, setTab] = React.useState('entrar');
  return (
    <Phone bg="var(--card)" safeBg="var(--card)">
      <div style={{ padding: '24px 26px 0', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Logo size={32} />
          <div style={{ marginTop: 'min(12vh, 90px)' }}>
            <h1 style={{ fontSize: 32, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 14 }}>O fim do<br />“chama no direct”.</h1>
            <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 300 }}>Receba gente já qualificada e marcada. Direto da sua bio.</p>
          </div>

          <div style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: 22 }}>
              {[['entrar', 'Entrar'], ['cadastrar', 'Criar conta']].map(([id, l]) => (
                <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '10px 0', borderRadius: 9, fontWeight: 700, fontSize: 14, background: tab === id ? 'var(--card)' : 'transparent', color: tab === id ? 'var(--ink)' : 'var(--muted)', boxShadow: tab === id ? 'var(--sh-sm)' : 'none', transition: 'all .15s' }}>{l}</button>
              ))}
            </div>

            <Button full size="lg" variant="outline" icon="google" onClick={tab === 'entrar' ? onLogin : onSignup} style={{ marginBottom: 12 }}>
              {tab === 'entrar' ? 'Entrar com Google' : 'Criar conta com Google'}
            </Button>
            <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--faint)', fontWeight: 600, margin: '6px 0 14px' }}>já conecta sua agenda depois</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 18px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} /><span style={{ fontSize: 12.5, color: 'var(--faint)', fontWeight: 600 }}>ou com e-mail</span><div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <Field placeholder="seu@email.com" icon="user" value="osvaldo.reis@gmail.com" onChange={() => {}} />
            <Field placeholder="Senha" type="password" icon="lock" value="••••••••" onChange={() => {}} style={{ marginTop: 11 }} />
            <Button full size="lg" onClick={tab === 'entrar' ? onLogin : onSignup} style={{ marginTop: 16 }} iconRight="arrowRight">
              {tab === 'entrar' ? 'Entrar' : 'Começar o setup'}
            </Button>
          </div>
        </div>
        <div style={{ padding: '24px 0 26px', textAlign: 'center', fontSize: 12.5, color: 'var(--faint)', lineHeight: 1.5 }}>
          Ao continuar você concorda com os Termos e a Política de Privacidade.
        </div>
      </div>
    </Phone>
  );
}

/* ===========================================================================
   DASHBOARD
   =========================================================================== */
function BioLinkCard({ slug }) {
  return (
    <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-lg)', padding: 16, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
        <Icon name="link" size={15} /> seu link da bio
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>agendai.com.br/f/{slug}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
        <button onClick={() => Store.toast('Link copiado!')} style={{ flex: 1, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.14)', color: '#fff', fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Icon name="copy" size={16} /> Copiar</button>
        <button onClick={() => Store.toast('Abrindo compartilhamento…')} style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Icon name="share" size={16} /> Compartilhar</button>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, tone = 'accent' }) {
  const tones = { accent: ['var(--accent-050)', 'var(--accent)'], info: ['var(--info-bg)', 'var(--info)'], amber: ['var(--amber-bg)', 'var(--amber)'] };
  const [bg, fg] = tones[tone];
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 14, flex: 1 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Icon name={icon} size={19} /></div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
    </div>
  );
}

function LeadRow({ lead, onClick, compact }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: compact ? '11px 0' : '12px 14px', textAlign: 'left', borderRadius: compact ? 0 : 14, background: 'transparent' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={lead.nome} size={44} bg="var(--accent-100)" fg="var(--accent-800)" />
        {lead._novo && <span style={{ position: 'absolute', top: -1, right: -1, width: 12, height: 12, borderRadius: 6, background: 'var(--danger)', border: '2px solid var(--card)' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{lead.nome}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          {lead.resumoEditado && <span title="resumo editado" style={{ color: 'var(--accent)', display: 'inline-flex', flexShrink: 0 }}><Icon name="edit" size={12} /></span>}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.resumoIA}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <Badge status={lead.status} />
        <span style={{ fontSize: 11.5, color: 'var(--faint)', fontWeight: 600 }}>{lead.criadoEm.replace('Agora mesmo', 'agora').replace(',', '')}</span>
      </div>
    </button>
  );
}

function Dashboard({ store, openLead, go }) {
  const novos = store.leads.filter((l) => l._novo || l.status === 'novo').length;
  const recent = store.leads.slice(0, 4);
  const hasLeads = store.leads.length > 0;
  return (
    <div style={{ padding: '4px 18px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <BioLinkCard slug={store.funnel.slug} />
      <div style={{ display: 'flex', gap: 10 }}>
        <StatCard icon="bell" value={novos} label="Leads novos" tone="accent" />
        <StatCard icon="calendar" value={store.appointments.length} label="Agendamentos" tone="info" />
        <StatCard icon="users" value={store.leads.length} label="Leads na semana" tone="amber" />
      </div>

      <button onClick={() => go('automacoes')} style={{ width: '100%', textAlign: 'left', background: 'linear-gradient(120deg, #1B231F, #244038)', borderRadius: 'var(--r-lg)', padding: 14, display: 'flex', alignItems: 'center', gap: 12, color: '#fff' }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="instagram" size={22} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>Comentou? Vira DM.</span><span style={{ fontSize: 9.5, fontWeight: 800, background: '#FFB35C', color: '#3a2400', padding: '2px 6px', borderRadius: 5 }}>PRO</span></span>
          <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(255,255,255,.65)', marginTop: 1 }}>Responda comentários do Insta no automático</span>
        </span>
        <Icon name="chevRight" size={18} style={{ opacity: .6 }} />
      </button>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
          <SectionLabel>Últimos leads</SectionLabel>
          <button onClick={() => go('leads')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Ver todos</button>
        </div>
        {hasLeads ? (
          <Card pad={6}>
            {recent.map((l, i) => (
              <React.Fragment key={l.id}>
                {i > 0 && <div style={{ height: 1, background: 'var(--line-soft)', margin: '0 14px' }} />}
                <div style={{ padding: '0 8px' }}><LeadRow lead={l} onClick={() => openLead(l.id)} compact /></div>
              </React.Fragment>
            ))}
          </Card>
        ) : (
          <Card><EmptyState icon="link" title="Seu link tá no ar" body="Assim que alguém clicar, o lead aparece aqui." action={<Button variant="soft" icon="copy" onClick={() => Store.toast('Link copiado!')}>Copiar link da bio</Button>} /></Card>
        )}
      </div>
    </div>
  );
}

/* ===========================================================================
   LEADS
   =========================================================================== */
function LeadsScreen({ store, openLead }) {
  const [filter, setFilter] = React.useState('todos');
  const [q, setQ] = React.useState('');
  const filters = [['todos', 'Todos'], ['novo', 'Novos'], ['agendado', 'Agendados'], ['em_conversa', 'Em conversa']];
  let list = store.leads;
  if (filter !== 'todos') list = list.filter((l) => l.status === filter);
  if (q.trim()) list = list.filter((l) => l.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: '0 18px' }}>
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg)', paddingBottom: 10, zIndex: 2 }}>
        <Field placeholder="Buscar por nome" icon="search" value={q} onChange={setQ} />
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', marginTop: 12 }} className="no-sb">
          {filters.map(([id, l]) => {
            const on = filter === id;
            return <button key={id} onClick={() => setFilter(id)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', background: on ? 'var(--ink)' : 'var(--card)', color: on ? '#fff' : 'var(--text)', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}`, flexShrink: 0, transition: 'all .15s' }}>{l}</button>;
          })}
        </div>
      </div>
      {list.length ? (
        <Card pad={6} style={{ marginTop: 4 }}>
          {list.map((l, i) => (
            <React.Fragment key={l.id}>
              {i > 0 && <div style={{ height: 1, background: 'var(--line-soft)', margin: '0 14px' }} />}
              <div style={{ padding: '0 8px' }}><LeadRow lead={l} onClick={() => openLead(l.id)} compact /></div>
            </React.Fragment>
          ))}
        </Card>
      ) : <EmptyState icon="users" title="Nada por aqui" body="Nenhum lead com esse filtro." />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '18px 0 8px', color: 'var(--faint)', fontSize: 12.5, fontWeight: 600 }}>
        <Icon name="lock" size={14} /> Seu histórico fica salvo aqui, sempre.
      </div>
    </div>
  );
}

/* ===========================================================================
   LEAD DETAIL
   =========================================================================== */
function LeadDetail({ lead, store, go }) {
  if (!lead) return <EmptyState title="Lead não encontrado" />;
  const appt = store.appointments.find((a) => a.leadId === lead.id);
  const waMsg = `Oi ${lead.nome.split(' ')[0]}! Aqui é o ${store.professional.nome.split(' ')[0]}. Recebi seu contato pelo link 🌿`;
  return (
    <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <Avatar name={lead.nome} size={52} bg="var(--accent-100)" fg="var(--accent-800)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>{lead.nome}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {lead.whatsapp && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="whatsapp" size={13} /> {fmtWhats(lead.whatsapp)}</span>}
              {lead.email && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="chat" size={13} /> {lead.email}</span>}
            </div>
          </div>
          <Badge status={lead.status} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {lead.whatsapp
            ? <a href={waLink(lead.whatsapp, waMsg)} target="_blank" rel="noopener" style={{ flex: 1, textDecoration: 'none' }}><Button full variant="whats" icon="whatsapp">Abrir no WhatsApp</Button></a>
            : lead.email
              ? <a href={`mailto:${lead.email}`} style={{ flex: 1, textDecoration: 'none' }}><Button full variant="dark" icon="chat">Enviar e-mail</Button></a>
              : null}
        </div>
      </Card>

      <ResumoIA lead={lead} />

      {appt && (
        <Card style={{ borderColor: 'var(--accent-200)' }} onClick={() => go('agenda')} hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--accent)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, opacity: .85 }}>{appt.diaRotulo.split(',')[1]?.trim().split(' ')[1] || ''}</span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{appt.diaRotulo.split(',')[1]?.trim().split(' ')[0] || ''}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{appt.diaRotulo}, {appt.hora}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Icon name={appt.modalidade === 'online' ? 'video' : 'mappin'} size={14} /> {appt.tipoAtendimento} · {appt.modalidade === 'online' ? 'Online' : 'Presencial'}
              </div>
            </div>
            <span style={{ color: 'var(--faint)' }}><Icon name="chevRight" size={18} /></span>
          </div>
        </Card>
      )}

      <div>
        <SectionLabel style={{ marginBottom: 8, paddingLeft: 2 }}>Respostas do funil</SectionLabel>
        <Card pad={4}>
          {lead.respostas.map((r, i) => (
            <div key={i} style={{ padding: '12px 14px', borderTop: i > 0 ? '1px solid var(--line-soft)' : 'none' }}>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>{r.pergunta}</div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14.5 }}>{r.valor}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 14px' }}>
        <span style={{ color: 'var(--accent)' }}><Icon name="shield" size={18} /></span>
        <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Consentimento registrado em {lead.consentimento.dataHora}</span>
      </div>
    </div>
  );
}

/* ===========================================================================
   AGENDA
   =========================================================================== */
function AgendaScreen({ store, openLead }) {
  const appts = [...store.appointments].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const groups = {};
  appts.forEach((a) => { (groups[a.diaRotulo] = groups[a.diaRotulo] || []).push(a); });
  const keys = Object.keys(groups);
  if (!appts.length) return <div style={{ padding: '0 18px' }}><EmptyState icon="calendar" title="Agenda livre" body="Quando alguém marcar pelo funil, aparece aqui — e no seu Google Agenda." /></div>;
  return (
    <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--accent-050)', borderRadius: 12, padding: '11px 14px' }}>
        <Icon name="google" size={18} /><span style={{ fontSize: 13, color: 'var(--accent-800)', fontWeight: 600 }}>Sincronizado com {store.professional.googleCalendar.calendarId}</span>
      </div>
      {keys.map((k) => (
        <div key={k}>
          <SectionLabel style={{ marginBottom: 8, paddingLeft: 2 }}>{k}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups[k].map((a) => {
              const lead = store.leads.find((l) => l.id === a.leadId);
              return (
                <Card key={a.id} onClick={() => lead && openLead(lead.id)} hover pad={14}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{a.hora}</div>
                    </div>
                    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{lead?.nome || 'Lead'}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <Icon name={a.modalidade === 'online' ? 'video' : 'mappin'} size={14} /> {a.tipoAtendimento} · {a.modalidade === 'online' ? 'Online' : 'Presencial'}
                      </div>
                    </div>
                    <Badge status="agendado">Confirmado</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- resumo da IA, editável (vira parte do histórico) ------------------- */
function ResumoIA({ lead, desk }) {
  const [editing, setEditing] = React.useState(false);
  const [txt, setTxt] = React.useState(lead.resumoIA);
  React.useEffect(() => { setTxt(lead.resumoIA); }, [lead.id]);
  const save = () => { if (txt.trim()) Store.updateLead(lead.id, { resumoIA: txt.trim(), resumoEditado: true }); setEditing(false); Store.toast('Resumo salvo ✓'); };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, padding: desk ? 0 : '0 2px' }}>
        <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="sparkles" size={16} /></span>
        <SectionLabel>Resumo da IA</SectionLabel>
        {lead.resumoEditado && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 6 }}>editado por você</span>}
        {!editing && <button onClick={() => setEditing(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 700, fontSize: 12.5 }}><Icon name="edit" size={14} /> Editar</button>}
      </div>
      {editing ? (
        <div>
          <Field as="textarea" rows={4} value={txt} onChange={setTxt} autoFocus />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button size="sm" onClick={save} icon="check">Salvar</Button>
            <Button size="sm" variant="ghost" onClick={() => { setTxt(lead.resumoIA); setEditing(false); }}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--accent-050)', border: '1px solid var(--accent-100)', borderRadius: 16, padding: 16, fontSize: desk ? 14.5 : 15, lineHeight: 1.55, color: 'var(--accent-800)', fontWeight: 500 }}>{lead.resumoIA}</div>
      )}
    </div>
  );
}

Object.assign(window, { LadoA, PushHeader, LoginScreen, Dashboard, LeadsScreen, LeadRow, LeadDetail, AgendaScreen, BioLinkCard, StatCard, ResumoIA, NotificationsSheet });
