/* ===========================================================================
   ladoC2.jsx — LadoC router + Detalhe da conta, Setups, Assinaturas, LGPD, Equipe
   =========================================================================== */

function LadoC({ start = 'overview' }) {
  const [authed, setAuthed] = React.useState(start !== 'entrar');
  const [screen, setScreen] = React.useState(start === 'entrar' ? 'overview' : start);
  const [proId, setProId] = React.useState('pro_osvaldo');
  const store = useStore();

  React.useEffect(() => { if (start === 'entrar') setAuthed(false); else { setAuthed(true); setScreen(start); } }, [start]);

  const openPro = (id) => { setProId(id); setScreen('detalhe'); };
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  let content;
  if (screen === 'overview') content = <Overview store={store} openPro={openPro} />;
  else if (screen === 'profissionais') content = <Profissionais store={store} openPro={openPro} />;
  else if (screen === 'detalhe') content = <DetalheConta store={store} proId={proId} back={() => setScreen('profissionais')} openSetup={() => setScreen('setups')} />;
  else if (screen === 'setups') content = <Setups store={store} />;
  else if (screen === 'assinaturas') content = <Assinaturas store={store} />;
  else if (screen === 'lgpd') content = <Lgpd store={store} />;
  else if (screen === 'equipe') content = <Equipe store={store} />;

  return <DeskShell screen={screen} setScreen={setScreen}>{content}</DeskShell>;
}

/* ===========================================================================
   DETALHE DA CONTA
   =========================================================================== */
function ActionBtn({ icon, label, onClick, danger }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
      border: `1.5px solid ${danger ? 'var(--danger-bg)' : 'var(--line)'}`, color: danger ? 'var(--danger)' : 'var(--ink)',
      background: h ? (danger ? 'var(--danger-bg)' : 'var(--bg)') : 'var(--card)', transition: 'background .14s',
    }}><Icon name={icon} size={17} />{label}</button>
  );
}

function DetalheConta({ store, proId, back, openSetup }) {
  const pro = allPros(store).find((p) => p.id === proId) || allPros(store)[0];
  const isOsvaldo = pro.id === 'pro_osvaldo';
  const sub = store.subscriptions.find((s) => s.professionalId === pro.id);
  const [impersonate, setImpersonate] = React.useState(false);
  return (
    <div>
      <button onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 16 }}><Icon name="arrowLeft" size={16} /> Profissionais</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <Avatar name={pro.nome} size={64} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 25, letterSpacing: '-.02em' }}>{pro.nome}</h1>
            <Badge status={pro.status} dot />
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{pro.especialidade} · <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{pro.handleInstagram}</span> · desde {pro.criadoEm}</div>
        </div>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <ActionBtn icon="bolt" label="Alterar plano" onClick={() => Store.toast('Alterar plano (mock)')} />
        <ActionBtn icon="refresh" label="Reenviar convite" onClick={() => Store.toast('Convite reenviado')} />
        <ActionBtn icon="sparkles" label="Abrir setup assistido" onClick={openSetup} />
        <ActionBtn icon="eye" label="Entrar como" onClick={() => setImpersonate(true)} />
        <ActionBtn icon="lock" label={pro.status === 'cancelado' ? 'Reativar' : 'Suspender'} danger onClick={() => Store.toast('Ação registrada no log')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        {/* left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Conta & pagamento</h3>
            <InfoRow label="Plano" value={<Badge bg={pro.plano === 'pro' ? 'var(--info-bg)' : 'var(--accent-050)'} fg={pro.plano === 'pro' ? 'var(--info)' : 'var(--accent-800)'}>{PLANO_LABEL[pro.plano]}</Badge>} />
            <InfoRow label="Pagamento" value={sub ? <Badge status={sub.status} dot /> : '—'} />
            <InfoRow label="Valor" value={sub ? `R$${sub.valor}/${sub.ciclo === 'mensal' ? 'mês' : 'única vez'}` : '—'} />
            <InfoRow label="Próx. vencimento" value={sub?.proximoVencimento || '—'} last />
          </DeskCard>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Leads & agenda</h3>
            <div style={{ display: 'flex', gap: 22 }}>
              <div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ink)' }}>{pro.leads}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>leads</div></div>
              <div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ink)' }}>{isOsvaldo ? store.appointments.length : Math.round(pro.leads * 0.4)}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>agendados</div></div>
              <div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: pro.agenda ? 'var(--accent)' : 'var(--faint)' }}>{pro.agenda ? 'Sim' : 'Não'}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>agenda conectada</div></div>
            </div>
            {isOsvaldo && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Últimos leads</div>
                {store.leads.slice(0, 3).map((l) => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                    <Avatar name={l.nome} size={28} bg="var(--accent-100)" fg="var(--accent-800)" />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{l.nome}</span>
                    <Badge status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </DeskCard>
        </div>
        {/* right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <DeskCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15 }}>Funil publicado</h3>
              <Badge bg="var(--accent-100)" fg="var(--accent-800)">{OBJ(isOsvaldo ? store.funnel.objetivo : 'agendar').titulo}</Badge>
            </div>
            <FunnelPreview funnel={isOsvaldo ? store.funnel : { mensagemBoasVindas: `Oi! Sou ${pro.nome.split(' ')[0]} 🌿 Me conta rapidinho como posso ajudar.`, perguntas: [{ texto: 'O que te interessa?', opcoes: ['Primeira vez', 'Retorno'] }] }} pro={isOsvaldo ? store.professional : { nome: pro.nome, especialidade: pro.especialidade }} />
          </DeskCard>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Histórico / auditoria</h3>
            {store.auditLog.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 11, padding: '9px 0', borderTop: '1px solid var(--line-soft)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                <div><div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>{a.acao}</div><div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{a.internalUser} · {a.dataHora}</div></div>
              </div>
            ))}
          </DeskCard>
        </div>
      </div>

      {impersonate && (
        <ConfirmModal icon="eye" title="Entrar como Osvaldo Reis?" body="Você verá o app exatamente como o profissional. A ação fica registrada no log de auditoria, com data e hora." confirm="Entrar como" onConfirm={() => { setImpersonate(false); Store.toast('Sessão de suporte registrada no log'); }} onClose={() => setImpersonate(false)} />
      )}
    </div>
  );
}
function InfoRow({ label, value, last }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: last ? 'none' : '1px solid var(--line-soft)' }}><span style={{ fontSize: 13.5, color: 'var(--muted)', fontWeight: 600 }}>{label}</span><span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 700 }}>{value}</span></div>;
}

/* ===========================================================================
   SETUPS ASSISTIDOS (kanban)
   =========================================================================== */
const SETUP_COLS = [['solicitado', 'Solicitado'], ['em_montagem', 'Em montagem'], ['aguardando_cliente', 'Aguardando cliente'], ['concluido', 'Concluído']];
const NEXT_STATUS = { solicitado: 'em_montagem', em_montagem: 'aguardando_cliente', aguardando_cliente: 'concluido' };

function Setups({ store }) {
  return (
    <div>
      <PageHead title="Setups assistidos" sub="Done-for-you · R$300–500 por conta" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, alignItems: 'start' }}>
        {SETUP_COLS.map(([id, label]) => {
          const cards = store.setups.filter((s) => s.status === id);
          return (
            <div key={id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 12, minHeight: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 6px 12px' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', background: 'var(--bg)', borderRadius: 7, padding: '2px 8px' }}>{cards.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map((c) => (
                  <div key={c.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                      <Avatar name={c.nome} size={30} bg="var(--accent-100)" fg="var(--accent-800)" />
                      <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nome}</div><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.especialidade}</div></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>R${c.valor}</span><span>{c.responsavel}</span>
                    </div>
                    {NEXT_STATUS[c.status]
                      ? <button onClick={() => Store.advanceSetup(c.id, NEXT_STATUS[c.status])} style={{ width: '100%', padding: '7px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 700, background: 'var(--accent-050)', color: 'var(--accent-800)', border: '1px solid var(--accent-100)' }}>Avançar →</button>
                      : <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Icon name="check" size={14} /> Entregue</div>}
                  </div>
                ))}
                {!cards.length && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--faint)', padding: '16px 0' }}>vazio</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===========================================================================
   ASSINATURAS
   =========================================================================== */
function Assinaturas({ store }) {
  const total = store.subscriptions.filter((s) => s.status !== 'cancelado' && s.ciclo === 'mensal').reduce((a, s) => a + s.valor, 0);
  return (
    <div>
      <PageHead title="Assinaturas" sub={`MRR R$ ${total.toLocaleString('pt-BR')} · ${store.subscriptions.length} contratos`} action={<Badge bg="var(--danger-bg)" fg="var(--danger-ink)" dot>1 atrasada</Badge>} />
      <DeskCard pad={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead><tr><Th>Profissional</Th><Th>Plano</Th><Th>Valor</Th><Th>Ciclo</Th><Th>Próx. vencimento</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {store.subscriptions.map((s) => (
                <tr key={s.id}>
                  <Td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={s.nome} size={32} bg="var(--accent-100)" fg="var(--accent-800)" /><span style={{ fontWeight: 700, color: 'var(--ink)' }}>{s.nome}</span></div></Td>
                  <Td><Badge bg={s.plano === 'pro' ? 'var(--info-bg)' : s.plano === 'setup' ? 'var(--amber-bg)' : 'var(--accent-050)'} fg={s.plano === 'pro' ? 'var(--info)' : s.plano === 'setup' ? 'var(--amber-ink)' : 'var(--accent-800)'}>{PLANO_LABEL[s.plano]}</Badge></Td>
                  <Td style={{ fontWeight: 700, color: 'var(--ink)' }}>R${s.valor}</Td>
                  <Td>{s.ciclo === 'mensal' ? 'Mensal' : 'Única'}</Td>
                  <Td>{s.proximoVencimento}</Td>
                  <Td><Badge status={s.status} dot /></Td>
                  <Td style={{ textAlign: 'right' }}>
                    {s.status === 'atrasado'
                      ? <button onClick={() => Store.toast('Cobrança marcada como resolvida (mock)')} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Marcar resolvida</button>
                      : <button onClick={() => Store.toast('Histórico de cobranças (mock)')} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Ver histórico</button>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DeskCard>
      <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--faint)', display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="lock" size={14} /> Sem gateway real — só visualização e gestão.</div>
    </div>
  );
}

/* ===========================================================================
   LGPD
   =========================================================================== */
const TIPO_LGPD = { acesso: 'Acesso', correcao: 'Correção', exclusao: 'Exclusão' };
function Lgpd({ store }) {
  const [excluir, setExcluir] = React.useState(null);
  return (
    <div>
      <PageHead title="LGPD" sub="Pedidos de titular, logs de consentimento e exclusão de dados" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, alignItems: 'start' }}>
        <DeskCard pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ color: 'var(--accent)' }}><Icon name="shield" size={18} /></span><h3 style={{ fontSize: 15 }}>Pedidos de titular</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><Th>Titular</Th><Th>Profissional</Th><Th>Tipo</Th><Th>Prazo</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {store.lgpdRequests.map((r) => (
                <tr key={r.id}>
                  <Td style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.leadNome}</Td>
                  <Td style={{ fontSize: 13 }}>{r.professionalNome}</Td>
                  <Td><Badge bg={r.tipo === 'exclusao' ? 'var(--danger-bg)' : 'var(--bg)'} fg={r.tipo === 'exclusao' ? 'var(--danger-ink)' : 'var(--muted)'}>{TIPO_LGPD[r.tipo]}</Badge></Td>
                  <Td style={{ fontSize: 13 }}>{r.prazo}</Td>
                  <Td><Badge status={r.status} dot /></Td>
                  <Td style={{ textAlign: 'right' }}>
                    {r.status === 'pendente' && (r.tipo === 'exclusao'
                      ? <button onClick={() => setExcluir(r)} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--danger)' }}>Excluir dados</button>
                      : <button onClick={() => Store.resolveLgpd(r.id)} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>Atender</button>)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </DeskCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Logs de consentimento</h3>
            <div style={{ maxHeight: 260, overflowY: 'auto' }} className="no-sb">
              {store.consentLogs.map((c) => (
                <div key={c.id} style={{ padding: '10px 0', borderTop: '1px solid var(--line-soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{c.leadNome}</span><span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.dataHora}</span></div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>“{c.texto}”</div>
                </div>
              ))}
            </div>
          </DeskCard>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Encarregado / DPO</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 10 }}>
              <Avatar name="Ana Beatriz" size={38} bg="var(--accent)" />
              <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Ana Beatriz</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>dpo@biofunil.com.br</div></div>
            </div>
          </DeskCard>
        </div>
      </div>

      {excluir && (
        <ConfirmModal danger icon="trash" title={`Excluir os dados de ${excluir.leadNome}?`} body="Esta ação anonimiza nome e WhatsApp e remove as respostas do lead. É irreversível e fica registrada no log de auditoria. Só Admin pode executar." confirm="Confirmar exclusão" doubleConfirm onConfirm={() => { Store.resolveLgpd(excluir.id); setExcluir(null); Store.toast('Dados anonimizados e registrados'); }} onClose={() => setExcluir(null)} />
      )}
    </div>
  );
}

/* ===========================================================================
   EQUIPE INTERNA
   =========================================================================== */
const PAPEL = { admin: ['Admin', 'var(--accent-100)', 'var(--accent-800)'], operacao: ['Operação / Suporte', 'var(--info-bg)', 'var(--info)'], financeiro: ['Financeiro', 'var(--amber-bg)', 'var(--amber-ink)'] };
const PERMS = {
  admin: 'Tudo, incl. “entrar como” e exclusão LGPD',
  operacao: 'Profissionais, setups e suporte',
  financeiro: 'Assinaturas e cobranças',
};
function Equipe({ store }) {
  return (
    <div>
      <PageHead title="Equipe interna" sub="Usuários e papéis" action={<Button variant="dark" icon="plus" onClick={() => Store.toast('Convidar membro (mock)')}>Convidar membro</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {store.internalUsers.map((u) => {
          const [label, bg, fg] = PAPEL[u.papel];
          return (
            <DeskCard key={u.id} pad={18}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name={u.nome} size={42} bg="var(--accent)" />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{u.nome}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div></div>
                <button onClick={() => Store.toast('Remover membro (mock)')} style={{ color: 'var(--faint)', display: 'flex' }}><Icon name="dots" size={18} /></button>
              </div>
              <Badge bg={bg} fg={fg}>{label}</Badge>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.45 }}>{PERMS[u.papel]}</div>
            </DeskCard>
          );
        })}
      </div>
      <DeskCard style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--accent)', flexShrink: 0 }}><Icon name="shield" size={20} /></span>
        <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5 }}>
          <b style={{ color: 'var(--ink)' }}>Papéis definem o acesso.</b> Apenas <b>Admin</b> pode usar “entrar como” e executar exclusões de dados (LGPD). Operação cuida de contas e setups; Financeiro vê assinaturas e cobranças.
        </div>
      </DeskCard>
    </div>
  );
}

/* ---- confirm modal ------------------------------------------------------- */
function ConfirmModal({ icon, title, body, confirm, onConfirm, onClose, danger, doubleConfirm }) {
  const [checked, setChecked] = React.useState(!doubleConfirm);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(21,33,28,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn .18s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card)', borderRadius: 18, padding: 26, maxWidth: 420, width: '100%', boxShadow: 'var(--sh-lg)', animation: 'popIn .26s both' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: danger ? 'var(--danger-bg)' : 'var(--accent-050)', color: danger ? 'var(--danger)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name={icon} size={26} /></div>
        <h3 style={{ fontSize: 19, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, margin: '0 0 18px' }}>{body}</p>
        {doubleConfirm && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
            <span onClick={() => setChecked(!checked)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? 'var(--danger)' : 'var(--line)'}`, background: checked ? 'var(--danger)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{checked && <Icon name="check" size={14} sw={3} />}</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>Entendo que esta ação é irreversível.</span>
          </label>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button full variant="outline" onClick={onClose}>Cancelar</Button>
          <Button full variant={danger ? 'danger' : 'primary'} disabled={!checked} onClick={onConfirm}>{confirm}</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LadoC, DetalheConta, Setups, Assinaturas, Lgpd, Equipe, ConfirmModal, ActionBtn, InfoRow });
