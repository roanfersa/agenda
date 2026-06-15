/* ===========================================================================
   ladoC.jsx — Backoffice interno (desktop-first). Equipe interna only.
   =========================================================================== */

/* ---- desktop window + sidebar shell -------------------------------------- */
function DeskShell({ screen, setScreen, children, crumb }) {
  const nav = [
    { id: 'overview', label: 'Visão geral', icon: 'grid' },
    { id: 'profissionais', label: 'Profissionais', icon: 'users' },
    { id: 'setups', label: 'Setups assistidos', icon: 'sparkles' },
    { id: 'assinaturas', label: 'Assinaturas', icon: 'card' },
    { id: 'lgpd', label: 'LGPD', icon: 'shield' },
    { id: 'equipe', label: 'Equipe interna', icon: 'user' },
  ];
  const activeNav = screen === 'detalhe' ? 'profissionais' : screen;
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#222B26', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 1320, height: 'calc(100vh - 56px - 48px)', minHeight: 620, background: 'var(--bg)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.4)', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,.2)' }}>
        {/* browser chrome */}
        <div style={{ height: 44, background: '#EDEAE3', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
          </div>
          <div style={{ flex: 1, maxWidth: 460, height: 26, background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px', fontSize: 12.5, color: 'var(--muted)', margin: '0 auto', fontWeight: 600 }}>
            <Icon name="lock" size={12} /> backoffice.agendai.com.br/admin/{screen === 'overview' ? '' : screen}
          </div>
          <div style={{ width: 60 }} />
        </div>
        {/* body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* sidebar */}
          <div style={{ width: 234, background: '#1B231F', display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '18px 14px' }}>
            <div style={{ padding: '0 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo size={24} light />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', margin: '0 8px 16px', background: 'rgba(255,159,67,.15)', color: '#FFB35C', fontSize: 11, fontWeight: 700, padding: '5px 9px', borderRadius: 7 }}>
              <Icon name="lock" size={12} /> Acesso restrito
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nav.map((n) => {
                const on = activeNav === n.id;
                return (
                  <button key={n.id} onClick={() => setScreen(n.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 9, textAlign: 'left',
                    fontSize: 13.5, fontWeight: on ? 700 : 600, transition: 'all .14s',
                    background: on ? 'rgba(255,255,255,.1)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.55)',
                  }}><Icon name={n.icon} size={18} />{n.label}</button>
                );
              })}
            </div>
            <div style={{ marginTop: 'auto', padding: 10, borderRadius: 11, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name="Ana Beatriz" size={32} bg="var(--accent)" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ana Beatriz</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Admin</div>
              </div>
            </div>
          </div>
          {/* content */}
          <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }} className="no-sb">
            {crumb}
            <div style={{ padding: '26px 30px 40px' }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- shared desk bits ---------------------------------------------------- */
function PageHead({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 27, letterSpacing: '-.02em', marginBottom: sub ? 5 : 0 }}>{title}</h1>
        {sub && <p style={{ fontSize: 14.5, color: 'var(--muted)', margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function DeskCard({ children, style, pad = 22 }) {
  return <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: pad, boxShadow: 'var(--sh-sm)', ...style }}>{children}</div>;
}
function Th({ children, style }) { return <th style={{ textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', padding: '0 14px 11px', whiteSpace: 'nowrap', ...style }}>{children}</th>; }
function Td({ children, style }) { return <td style={{ padding: '13px 14px', fontSize: 14, color: 'var(--text)', borderTop: '1px solid var(--line-soft)', ...style }}>{children}</td>; }

/* ===========================================================================
   LOGIN INTERNO
   =========================================================================== */
function AdminLogin({ onLogin }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#1B231F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 400, maxWidth: '100%', background: 'var(--card)', borderRadius: 20, padding: 32, boxShadow: '0 30px 70px rgba(0,0,0,.4)' }}>
        <Logo size={28} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--amber-bg)', color: 'var(--amber-ink)', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 8, margin: '22px 0 6px' }}>
          <Icon name="lock" size={13} /> Backoffice — acesso restrito
        </div>
        <h1 style={{ fontSize: 23, letterSpacing: '-.02em', margin: '6px 0 6px' }}>Entrar na operação</h1>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 22px', lineHeight: 1.5 }}>Use seu e-mail corporativo. Não há cadastro aberto.</p>
        <Field label="E-mail corporativo" icon="user" value="ana@biofunil.com.br" onChange={() => {}} />
        <Field label="Senha" type="password" icon="lock" value="••••••••••" onChange={() => {}} style={{ marginTop: 14 }} />
        <Button full size="lg" variant="dark" onClick={onLogin} style={{ marginTop: 20 }} iconRight="arrowRight">Entrar</Button>
      </div>
    </div>
  );
}

/* ===========================================================================
   VISÃO GERAL
   =========================================================================== */
function Metric({ icon, value, label, delta, tone = 'accent' }) {
  const tones = { accent: ['var(--accent-050)', 'var(--accent)'], info: ['var(--info-bg)', 'var(--info)'], amber: ['var(--amber-bg)', 'var(--amber)'], ink: ['#EEECE6', 'var(--ink)'] };
  const [bg, fg] = tones[tone];
  return (
    <DeskCard pad={18} style={{ flex: '1 1 180px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} /></span>
        {delta && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{delta}</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, fontWeight: 600 }}>{label}</div>
    </DeskCard>
  );
}

function GrowthChart() {
  const data = [12, 18, 23, 29, 38, 44, 51, 58, 67, 79, 92, 104];
  const meses = ['jul', 'ago', 'set', 'out', 'nov', 'dez', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun'];
  const max = 110, W = 640, H = 180, pad = 8;
  const pts = data.map((d, i) => [pad + (i * (W - pad * 2)) / (data.length - 1), H - (d / max) * (H - 20)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  return (
    <DeskCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div><h3 style={{ fontSize: 16 }}>Profissionais ao longo do tempo</h3><div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Últimos 12 meses</div></div>
        <Badge bg="var(--accent-100)" fg="var(--accent-800)">+18% no mês</Badge>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} style={{ width: '100%', height: 'auto', display: 'block', marginTop: 8 }}>
        <defs><linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity="0.18" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
        <path d={area} fill="url(#cgrad)" />
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 0} fill="var(--accent)" stroke="#fff" strokeWidth="2" />)}
        {meses.map((m, i) => <text key={i} x={pts[i][0]} y={H + 13} fontSize="10" fill="var(--faint)" textAnchor="middle" fontFamily="var(--font)" fontWeight="600">{m}</text>)}
      </svg>
    </DeskCard>
  );
}

function AlertItem({ icon, tone, title, sub, action, onAction }) {
  const map = { danger: ['var(--danger-bg)', 'var(--danger)'], amber: ['var(--amber-bg)', 'var(--amber)'], info: ['var(--info-bg)', 'var(--info)'] };
  const [bg, fg] = map[tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderTop: '1px solid var(--line-soft)' }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={18} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>
      </div>
      <button onClick={onAction} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap', padding: '7px 12px', borderRadius: 9, border: '1.5px solid var(--line)' }}>{action}</button>
    </div>
  );
}

function Overview({ store, openPro }) {
  const ativos = store.otherPros.filter((p) => p.status === 'ativo').length + 1;
  return (
    <div>
      <PageHead title="Visão geral" sub="Sexta, 13 de junho de 2026" />
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        <Metric icon="users" value={ativos} label="Profissionais ativos" delta="+18%" tone="accent" />
        <Metric icon="money" value="R$ 9.847" label="MRR estimado" delta="+12%" tone="ink" />
        <Metric icon="sparkles" value="14" label="Novos no mês" tone="info" />
        <Metric icon="bolt" value="2" label="Setups na fila" tone="amber" />
        <Metric icon="chat" value="312" label="Leads (semana)" tone="accent" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <GrowthChart />
        <DeskCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <span style={{ color: 'var(--amber)' }}><Icon name="alert" size={18} /></span>
            <h3 style={{ fontSize: 16 }}>Alertas operacionais</h3>
          </div>
          <AlertItem tone="danger" icon="card" title="Pagamento falhou" sub="Renata Aragão · Entrada R$97" action="Ver" onAction={() => openPro('pro_renata')} />
          <AlertItem tone="amber" icon="calendar" title="Sem agenda conectada" sub="Thiago Barros · há 5 dias" action="Ver" onAction={() => openPro('pro_thiago')} />
          <AlertItem tone="info" icon="funnel" title="Funil sem leads há 9 dias" sub="Sandra Vidal · risco de churn" action="Ver" onAction={() => openPro('pro_sandra')} />
          <AlertItem tone="amber" icon="shield" title="2 pedidos LGPD pendentes" sub="Prazo mais próximo: 18/06" action="Abrir" onAction={() => {}} />
        </DeskCard>
      </div>
    </div>
  );
}

/* ===========================================================================
   PROFISSIONAIS
   =========================================================================== */
function allPros(store) {
  return [
    { id: 'pro_osvaldo', nome: store.professional.nome, handleInstagram: store.professional.handleInstagram, especialidade: store.professional.especialidade, plano: 'entrada', status: 'ativo', agenda: store.professional.googleCalendar.conectado, leads: store.leads.length, criadoEm: store.professional.criadoEm },
    ...store.otherPros,
  ];
}
const PLANO_LABEL = { entrada: 'Entrada', pro: 'Pro', setup: 'Setup' };

function Profissionais({ store, openPro }) {
  const [status, setStatus] = React.useState('todos');
  const [q, setQ] = React.useState('');
  let rows = allPros(store);
  if (status !== 'todos') rows = rows.filter((r) => r.status === status);
  if (q.trim()) rows = rows.filter((r) => (r.nome + r.handleInstagram).toLowerCase().includes(q.toLowerCase()));
  const filters = [['todos', 'Todos'], ['ativo', 'Ativos'], ['trial', 'Trial'], ['inadimplente', 'Inadimplentes'], ['cancelado', 'Cancelados']];
  return (
    <div>
      <PageHead title="Profissionais" sub={`${allPros(store).length} contas`} />
      <DeskCard pad={0}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}><Field placeholder="Buscar nome ou @" icon="search" value={q} onChange={setQ} /></div>
          <div style={{ display: 'flex', gap: 7 }}>
            {filters.map(([id, l]) => { const on = status === id; return <button key={id} onClick={() => setStatus(id)} style={{ padding: '8px 13px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: on ? 'var(--ink)' : 'var(--bg)', color: on ? '#fff' : 'var(--muted)', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line)'}`, transition: 'all .14s' }}>{l}</button>; })}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead><tr>
              <Th>Profissional</Th><Th>Especialidade</Th><Th>Plano</Th><Th>Status</Th><Th>Agenda</Th><Th style={{ textAlign: 'right' }}>Leads</Th><Th>Cadastro</Th><Th></Th>
            </tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => openPro(r.id)} style={{ cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <Avatar name={r.nome} size={36} bg="var(--accent-100)" fg="var(--accent-800)" />
                      <div><div style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.nome}</div><div style={{ fontSize: 12.5, color: 'var(--accent)', fontWeight: 600 }}>{r.handleInstagram}</div></div>
                    </div>
                  </Td>
                  <Td>{r.especialidade}</Td>
                  <Td><Badge bg={r.plano === 'pro' ? 'var(--info-bg)' : 'var(--accent-050)'} fg={r.plano === 'pro' ? 'var(--info)' : 'var(--accent-800)'}>{PLANO_LABEL[r.plano]}</Badge></Td>
                  <Td><Badge status={r.status} dot /></Td>
                  <Td>{r.agenda ? <span style={{ color: 'var(--accent)', display: 'inline-flex' }}><Icon name="checkCircle" size={19} /></span> : <span style={{ color: 'var(--faint)', display: 'inline-flex' }}><Icon name="x" size={18} /></span>}</Td>
                  <Td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}>{r.leads}</Td>
                  <Td style={{ color: 'var(--muted)', fontSize: 13 }}>{r.criadoEm}</Td>
                  <Td style={{ textAlign: 'right', color: 'var(--faint)' }}><Icon name="chevRight" size={17} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DeskCard>
    </div>
  );
}

Object.assign(window, { DeskShell, PageHead, DeskCard, Th, Td, AdminLogin, Overview, Metric, GrowthChart, AlertItem, Profissionais, allPros, PLANO_LABEL });
