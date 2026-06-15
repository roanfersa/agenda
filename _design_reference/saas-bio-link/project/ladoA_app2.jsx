/* ===========================================================================
   ladoA_app2.jsx — Editar funil, Configurações, Planos
   =========================================================================== */

/* ---- mini chat preview --------------------------------------------------- */
function FunnelPreview({ funnel, pro }) {
  return (
    <div style={{ background: '#EBE7DF', borderRadius: 16, padding: 14, border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <Avatar name={pro.nome} size={32} />
        <div><div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{pro.nome}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{pro.especialidade}</div></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: '#fff', padding: '9px 12px', borderRadius: 14, borderBottomLeftRadius: 4, fontSize: 13, color: 'var(--ink)', lineHeight: 1.4, boxShadow: 'var(--sh-sm)' }}>{funnel.mensagemBoasVindas}</div>
        {funnel.perguntas[0] && <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: '#fff', padding: '9px 12px', borderRadius: 14, borderBottomLeftRadius: 4, fontSize: 13, color: 'var(--ink)', boxShadow: 'var(--sh-sm)' }}>{funnel.perguntas[0].texto}</div>}
        {funnel.perguntas[0]?.opcoes && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
            {funnel.perguntas[0].opcoes.map((o, i) => <span key={i} style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-800)', background: '#fff', border: '1.5px solid var(--accent-200)', padding: '6px 11px', borderRadius: 16 }}>{o}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===========================================================================
   EDITAR FUNIL
   =========================================================================== */
function FunilScreen({ store, onSaved }) {
  const [welcome, setWelcome] = React.useState(store.funnel.mensagemBoasVindas);
  const [questions, setQuestions] = React.useState(store.funnel.perguntas.map((q) => ({ ...q, ativa: true })));
  const [objetivo, setObjetivo] = React.useState(store.funnel.objetivo || 'agendar');
  const [consent, setConsent] = React.useState(store.funnel.consentimentoTexto);
  const [campos, setCampos] = React.useState(store.funnel.camposContato || { email: true, whatsapp: true });
  const [quando, setQuando] = React.useState(store.funnel.contatoQuando || 'fim');
  const [tab, setTab] = React.useState('editar');

  const setQ = (i, patch) => setQuestions((qs) => qs.map((x, j) => j === i ? { ...x, ...patch } : x));
  const addQ = () => setQuestions((qs) => [...qs, { id: 'q' + Date.now(), texto: 'Nova pergunta', tipo: 'opcoes', opcoes: ['Opção 1', 'Opção 2'], obrigatoria: false, ativa: true }]);
  const rmQ = (i) => setQuestions((qs) => qs.filter((_, j) => j !== i));

  const save = () => {
    Store.updateFunnel({ objetivo, modo: objetivo === 'agendar' ? 'ambos' : 'capturar', mensagemBoasVindas: welcome, consentimentoTexto: consent, camposContato: campos, contatoQuando: quando, perguntas: questions.filter((q) => q.ativa).map(({ ativa, ...q }) => q) });
    Store.toast('Funil republicado ✓');
    onSaved?.();
  };
  const previewFunnel = { ...store.funnel, objetivo, mensagemBoasVindas: welcome, perguntas: questions.filter((q) => q.ativa) };

  return (
    <div style={{ padding: '0 18px 12px' }}>
      <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: 18, border: '1px solid var(--line)' }}>
        {[['editar', 'Editar'], ['previa', 'Prévia']].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, fontWeight: 700, fontSize: 14, background: tab === id ? 'var(--card)' : 'transparent', color: tab === id ? 'var(--ink)' : 'var(--muted)', boxShadow: tab === id ? 'var(--sh-sm)' : 'none' }}>{l}</button>
        ))}
      </div>

      {tab === 'previa' ? <FunnelPreview funnel={previewFunnel} pro={store.professional} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <SectionLabel style={{ marginBottom: 8 }}>Objetivo do funil</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
              {OBJETIVOS.map((m) => {
                const on = objetivo === m.id;
                return <button key={m.id} onClick={() => setObjetivo(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 10px', borderRadius: 12, fontWeight: 700, fontSize: 12.5, background: on ? 'var(--accent-050)' : 'var(--card)', color: on ? 'var(--accent-800)' : 'var(--muted)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`, transition: 'all .15s' }}><Icon name={m.icon} size={16} />{m.curto}</button>;
              })}
            </div>
          </div>
          <div>
            <SectionLabel style={{ marginBottom: 8 }}>Mensagem de boas-vindas</SectionLabel>
            <EditableBlock value={welcome} onChange={setWelcome} multiline />
          </div>
          <div>
            <SectionLabel style={{ marginBottom: 8 }}>Perguntas de qualificação</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions.map((q, i) => (
                <QuestionEditor key={q.id} q={q} onChange={(patch) => setQ(i, patch)} onRemove={questions.length > 1 ? () => rmQ(i) : null} />
              ))}
            </div>
            <button onClick={addQ} style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 12, border: '1.5px dashed var(--accent-200)', color: 'var(--accent-800)', background: 'var(--accent-050)', fontWeight: 700, fontSize: 14 }}><Icon name="plus" size={17} /> Adicionar pergunta</button>
          </div>
          <div>
            <SectionLabel style={{ marginBottom: 8 }}>Dados de contato</SectionLabel>
            <ContactConfig campos={campos} setCampos={setCampos} quando={quando} setQuando={setQuando} objetivo={objetivo} />
          </div>
          <div>
            <SectionLabel style={{ marginBottom: 8 }}>Texto de consentimento (LGPD)</SectionLabel>
            <EditableBlock value={consent} onChange={setConsent} multiline />
          </div>
        </div>
      )}

      <div style={{ position: 'sticky', bottom: 0, background: 'linear-gradient(transparent, var(--bg) 26%)', padding: '18px 0 8px', marginTop: 8 }}>
        <Button full size="lg" icon="refresh" onClick={save}>Salvar e republicar</Button>
      </div>
    </div>
  );
}

/* ===========================================================================
   CONFIGURAÇÕES
   =========================================================================== */
function SettingsRow({ icon, label, value, onClick, right, danger, last }) {
  const [h, setH] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', textAlign: 'left', cursor: onClick ? 'pointer' : 'default', background: h && onClick ? 'var(--bg)' : 'transparent', borderTop: last ? '1px solid var(--line-soft)' : 'none', transition: 'background .12s' }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: danger ? 'var(--danger-bg)' : 'var(--accent-050)', color: danger ? 'var(--danger)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={18} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: danger ? 'var(--danger)' : 'var(--ink)' }}>{label}</div>
        {value && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>}
      </div>
      {right || (onClick && <span style={{ color: 'var(--faint)' }}><Icon name="chevRight" size={17} /></span>)}
    </div>
  );
}
function SettingsGroup({ title, children }) {
  return (
    <div>
      {title && <SectionLabel style={{ marginBottom: 8, paddingLeft: 2 }}>{title}</SectionLabel>}
      <Card pad={0} style={{ overflow: 'hidden' }}>{children}</Card>
    </div>
  );
}

function ConfigScreen({ store, go }) {
  const cal = store.professional.googleCalendar;
  const [editConsent, setEditConsent] = React.useState(false);
  const [consent, setConsent] = React.useState(store.professional.consentimentoTextoPadrao);
  return (
    <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={store.professional.nome} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>{store.professional.nome}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{store.professional.especialidade}</div>
            <div style={{ fontSize: 12.5, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{store.professional.handleInstagram}</div>
          </div>
        </div>
      </Card>

      <SettingsGroup title="Conta">
        <SettingsRow icon="user" label="Perfil" value="Nome, foto, especialidade" onClick={() => Store.toast('Editar perfil')} />
        <SettingsRow icon="whatsapp" label="WhatsApp" value={fmtWhats(store.professional.whatsapp)} onClick={() => Store.toast('Editar WhatsApp')} last />
        <SettingsRow icon="funnel" label="Meus funis" value={`${store.funnels.length} funis · ativo: ${store.funnel.nome}`} onClick={() => go('funis')} last />
      </SettingsGroup>

      <SettingsGroup title="Integrações">
        <SettingsRow icon="calendar" label="Google Agenda"
          value={cal.conectado ? `Conectado · ${cal.email}` : 'Não conectado'}
          right={cal.conectado
            ? <button onClick={() => Store.disconnectCalendar()} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>Desconectar</button>
            : <button onClick={() => Store.connectCalendar()} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>Conectar</button>} />
        <SettingsRow icon="instagram" label="Automações do Instagram" value="Comentário → DM · 2 ativas" onClick={() => go('automacoes')} last />
      </SettingsGroup>

      <SettingsGroup title="Avisos de lead novo">
        <div style={{ padding: '4px 0' }}>
          {[['email', 'chat', 'Por e-mail', store.professional.avisos?.email], ['push', 'bell', 'Push no celular', store.professional.avisos?.push]].map(([key, ic, label, on], i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 14px', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={18} /></span>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>{label}</div>
              <Toggle on={!!on} onClick={() => Store.toggleAviso(key)} />
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 14px 10px', lineHeight: 1.4 }}>Te avisamos na hora que entra um lead — você não precisa ficar de olho no app.</div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Privacidade · LGPD">
        <div style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={18} /></span>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>Texto de consentimento</div>
            <button onClick={() => setEditConsent(!editConsent)} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>{editConsent ? 'Pronto' : 'Editar'}</button>
          </div>
          {editConsent
            ? <Field as="textarea" rows={4} value={consent} onChange={setConsent} />
            : <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0, paddingLeft: 44 }}>{consent}</p>}
        </div>
        <SettingsRow icon="user" label="Encarregado / DPO" value="osvaldo.reis@gmail.com" last />
      </SettingsGroup>

      <SettingsGroup title="Plano">
        <SettingsRow icon="bolt" label="Meu plano" value="Entrada · R$97/mês" onClick={() => go('planos')} />
      </SettingsGroup>

      <Card pad={0}><SettingsRow icon="logout" label="Sair" danger onClick={() => Store.toast('Saindo…')} /></Card>
      <div style={{ height: 8 }} />
    </div>
  );
}

/* ===========================================================================
   PLANOS
   =========================================================================== */
function PlanosScreen({ store }) {
  const planos = [
    { id: 'entrada', nome: 'Entrada', preco: 'R$97', periodo: '/mês', atual: store.professional.plano === 'entrada', destaque: false,
      features: ['Bio-funil + qualificação', 'Agendamento no fluxo', 'Resumo do lead no WhatsApp', 'Leads e agenda ilimitados'] },
    { id: 'pro', nome: 'Pro · “Secretária”', preco: 'R$297', periodo: '/mês', atual: false, soon: true, destaque: true,
      features: ['Tudo do Entrada', 'Automação de WhatsApp', 'Comment → DM do Instagram', 'Follow-up e lembrete por IA', 'Reagendamento e multi-atendente'] },
    { id: 'setup', nome: 'Setup assistido', preco: 'R$300–500', periodo: 'única vez', atual: false, destaque: false,
      features: ['A gente monta seu funil pra você', 'Sessão de configuração', 'Funil pronto pra publicar'] },
  ];
  return (
    <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: 'var(--ink)', borderRadius: 16, padding: '16px 18px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--accent-200)' }}><Icon name="bolt" size={22} /></span>
        <div><div style={{ fontWeight: 700, fontSize: 15 }}>Uma secretária custa R$1.500+/mês.</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>O Agendaí faz o filtro e marca por você.</div></div>
      </div>

      {planos.map((p) => (
        <div key={p.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', border: `2px solid ${p.destaque ? 'var(--accent)' : 'var(--line)'}`, padding: 18, position: 'relative', boxShadow: p.destaque ? 'var(--sh)' : 'var(--sh-sm)' }}>
          {p.soon && <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 11, fontWeight: 800, color: 'var(--amber-ink)', background: 'var(--amber-bg)', padding: '4px 9px', borderRadius: 8 }}>EM BREVE</span>}
          {p.atual && <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 11, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-100)', padding: '4px 9px', borderRadius: 8 }}>SEU PLANO</span>}
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>{p.nome}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '8px 0 16px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--ink)', letterSpacing: '-.02em' }}>{p.preco}</span>
            <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>{p.periodo}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
            {p.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.35 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}><Icon name="check" size={16} sw={2.5} /></span>{f}
              </div>
            ))}
          </div>
          <Button full variant={p.atual ? 'soft' : p.soon ? 'outline' : p.destaque ? 'primary' : 'dark'} disabled={p.atual}
            onClick={() => Store.toast(p.soon ? 'Avisaremos quando chegar!' : 'Plano selecionado (mock)')}>
            {p.atual ? 'Plano atual' : p.soon ? 'Quero saber quando chegar' : p.id === 'setup' ? 'Quero o setup assistido' : 'Assinar'}
          </Button>
        </div>
      ))}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--faint)', padding: '4px 0 8px' }}>Pagamento simulado neste protótipo.</div>
    </div>
  );
}

/* ===========================================================================
   FUNIS — lista de funis (multi-funnel)
   =========================================================================== */
function FunilCard({ f, store, active, onEdit, compact }) {
  const leads = store.leads.filter((l) => l.funnelId === f.id).length;
  const obj = OBJ(f.objetivo);
  return (
    <div style={{ background: 'var(--card)', border: `1.5px solid ${active ? 'var(--accent-200)' : 'var(--line)'}`, borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={obj.icon} size={22} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15.5, color: 'var(--ink)' }}>{f.nome}</span>
            {active && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-100)', padding: '2px 6px', borderRadius: 5, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="link" size={10} /> NA BIO</span>}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>{obj.titulo} · <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{f.uso || 'Outro'}</span></div>
        </div>
        <Badge status={f.status === 'publicado' ? 'ativo' : 'cancelado'}>{f.status === 'publicado' ? 'Publicado' : 'Pausado'}</Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '13px 0', background: 'var(--bg)', borderRadius: 10, padding: '9px 11px' }}>
        <Icon name="link" size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>agendai.com.br/f/{f.slug}</span>
        <button onClick={() => Store.toast('Link copiado!')} style={{ color: 'var(--muted)', display: 'flex', flexShrink: 0 }}><Icon name="copy" size={15} /></button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, fontSize: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}><Icon name="users" size={15} /><b style={{ color: 'var(--ink)' }}>{leads}</b> leads</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button full size="sm" variant="dark" icon="edit" onClick={onEdit}>Editar</Button>
        {!active && <Button size="sm" variant="outline" onClick={() => Store.setActiveFunnel(f.id)}>Usar na bio</Button>}
        <Button size="sm" variant="outline" onClick={() => Store.toggleFunnelStatus(f.id)}>{f.status === 'publicado' ? 'Pausar' : 'Publicar'}</Button>
        {!active && <Button size="sm" variant="ghost" onClick={() => Store.deleteFunnel(f.id)}><Icon name="trash" size={16} /></Button>}
      </div>
    </div>
  );
}

function FunisList({ store, compact, onEdit, onNew }) {
  return (
    <div style={{ padding: compact ? '0 18px' : 0 }}>
      {!compact && <PageHead title="Funis" sub={`${store.funnels.length} funis · cada um com seu próprio link`} action={<Button icon="plus" onClick={onNew}>Novo funil</Button>} />}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--accent-050)', border: '1px solid var(--accent-100)', borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
        <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}><Icon name="link" size={17} /></span>
        <span style={{ fontSize: 12.5, color: 'var(--accent-800)', lineHeight: 1.5, fontWeight: 500 }}>Cada funil tem seu próprio link. O marcado <b>NA BIO</b> é o que vai no seu Instagram; os outros você usa em <b>campanha paga, stories ou anúncio</b> — e vê os leads separados por origem.</span>
      </div>
      {compact && (
        <button onClick={onNew} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 14.5, marginBottom: 14, boxShadow: 'var(--sh-sm)' }}><Icon name="plus" size={18} sw={2.4} /> Novo funil</button>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {store.funnels.map((f) => (
          <FunilCard key={f.id} f={f} store={store} active={f.id === store.activeFunnelId} compact={compact} onEdit={() => { Store.setActiveFunnel(f.id); onEdit(f.id); }} />
        ))}
      </div>
    </div>
  );
}

/* ---- shared contact-fields config (onboarding + editors) ---------------- */
function ContactConfig({ campos, setCampos, quando, setQuando, objetivo }) {
  const agenda = objetivo === 'agendar';
  const rows = [
    { key: 'nome', label: 'Nome', locked: true },
    { key: 'email', label: 'E-mail' },
    { key: 'whatsapp', label: 'WhatsApp' },
  ];
  return (
    <div>
      <div style={{ background: 'var(--card)', border: '1.5px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={r.key === 'nome' ? 'user' : r.key === 'email' ? 'chat' : 'whatsapp'} size={16} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{r.label}</div>
              {r.locked && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Sempre coletado</div>}
            </div>
            {r.locked
              ? <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-100)', padding: '3px 8px', borderRadius: 6 }}>OBRIGATÓRIO</span>
              : <Toggle on={!!campos[r.key]} onClick={() => setCampos({ ...campos, [r.key]: !campos[r.key] })} />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Quando pedir o contato?</div>
        {agenda ? (
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--bg)', borderRadius: 12, padding: '11px 13px' }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}><Icon name="clock" size={16} /></span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>Neste funil de agendamento, o contato é sempre pedido <b style={{ color: 'var(--ink)' }}>logo após a escolha do horário</b>, dentro da reserva de 10 min — pra não segurar slot à toa.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            {[['inicio', 'Após a 1ª pergunta'], ['fim', 'No final']].map(([id, l]) => {
              const on = quando === id;
              return <button key={id} onClick={() => setQuando(id)} style={{ flex: 1, padding: '11px 8px', borderRadius: 12, fontWeight: 700, fontSize: 12.5, background: on ? 'var(--accent-050)' : 'var(--card)', color: on ? 'var(--accent-800)' : 'var(--muted)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`, transition: 'all .15s' }}>{l}</button>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { FunilScreen, ConfigScreen, PlanosScreen, FunnelPreview, SettingsRow, SettingsGroup, FunisList, FunilCard, ContactConfig });
