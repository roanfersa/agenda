/* ===========================================================================
   ladoA_instagram.jsx — Automações Instagram (comentário → DM), estilo ManyChat
   Preview da feature do tier Pro/"Secretária". Responsivo (compact = mobile).
   =========================================================================== */

function InstaPostThumb({ rule, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, #2A5D52, #0E8A6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42 }}>
      <span>{rule.postEmoji}</span>
    </div>
  );
}

/* ---- main screen --------------------------------------------------------- */
function InstaAutomacoes({ compact }) {
  const store = useStore();
  const [editing, setEditing] = React.useState(null); // rule object or 'new'
  const [simRule, setSimRule] = React.useState(null);
  const autos = store.automations;
  const totalDms = autos.reduce((a, r) => a + r.stats.dms, 0);
  const totalLeads = autos.reduce((a, r) => a + r.stats.leads, 0);

  const Wrap = compact ? 'div' : 'div';
  return (
    <div style={{ padding: compact ? '0 18px' : 0 }}>
      {!compact && <PageHead title="Automações do Instagram" sub="Comentou a palavra-chave? A DM sai sozinha." action={<Button icon="plus" onClick={() => setEditing('new')}>Nova automação</Button>} />}

      {/* connection + Pro banner */}
      <div style={{ background: 'linear-gradient(120deg, #1B231F, #244038)', borderRadius: 16, padding: compact ? 16 : '18px 22px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="instagram" size={24} /></div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>@osvaldo.terapia conectado</span>
            <span style={{ fontSize: 10.5, fontWeight: 800, background: '#FFB35C', color: '#3a2400', padding: '3px 7px', borderRadius: 6 }}>RECURSO PRO</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>{totalDms} DMs enviadas · {totalLeads} viraram leads no funil</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(63,200,146,.2)', color: '#7CF0C8', fontSize: 12, fontWeight: 700, padding: '6px 11px', borderRadius: 20 }}><span style={{ width: 7, height: 7, borderRadius: 7, background: '#3FC892' }} /> Ativo</span>
      </div>

      {compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <SectionLabel>Suas automações</SectionLabel>
          <button onClick={() => setEditing('new')} style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="plus" size={15} /> Nova</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
        {autos.map((r) => (
          <AutomacaoCard key={r.id} rule={r} compact={compact} onTest={() => setSimRule(r)} onEdit={() => setEditing(r)} />
        ))}
      </div>

      {!compact && (
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--faint)' }}>
          <Icon name="shield" size={14} /> A DM só é enviada a quem comentou — sem disparo em massa. O contato segue pedindo consentimento no funil.
        </div>
      )}

      {editing && <AutomacaoEditor rule={editing === 'new' ? null : editing} store={store} onClose={() => setEditing(null)} onTest={(r) => { setEditing(null); setSimRule(r); }} />}
      {simRule && <CommentDMSim rule={simRule} store={store} onClose={() => setSimRule(null)} />}
    </div>
  );
}

/* ---- automation card ----------------------------------------------------- */
function AutomacaoCard({ rule, compact, onTest, onEdit }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', opacity: rule.ativa ? 1 : 0.72 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <InstaPostThumb rule={rule} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 3 }}>
            <Icon name="instagram" size={13} /> {rule.postTipo}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14.5, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rule.postLegenda}</div>
        </div>
        <Toggle on={rule.ativa} onClick={() => Store.toggleAutomation(rule.id)} />
      </div>

      <div style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Gatilho:</span>
        {rule.keywords.map((k) => (
          <span key={k} style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-050)', border: '1px solid var(--accent-100)', padding: '4px 9px', borderRadius: 7, letterSpacing: '.02em' }}>{k}</span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg)', borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
        <span style={{ color: 'var(--accent)', flexShrink: 0 }}><Icon name="send" size={16} /></span>
        <span style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{rule.dmMensagem}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        {[['comentarios', 'comentários', 'chat'], ['dms', 'DMs', 'send'], ['leads', 'leads', 'users']].map(([k, l, ic]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--faint)' }}><Icon name={ic} size={14} /></span>
            <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: 14 }}>{rule.stats[k]}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button full size="sm" variant="dark" icon="bolt" onClick={onTest}>Testar ao vivo</Button>
        <Button size="sm" variant="outline" icon="edit" onClick={onEdit}>Editar</Button>
      </div>
    </div>
  );
}

/* ---- editor (overlay) ---------------------------------------------------- */
const MOCK_POSTS = [
  { postLegenda: '3 sinais de que sua ansiedade pede ajuda', postTipo: 'Reels', postEmoji: '🌿' },
  { postLegenda: 'Carrossel: 5 práticas de autoconhecimento', postTipo: 'Carrossel', postEmoji: '✨' },
  { postLegenda: 'O que é terapia tântrica (sem tabu)', postTipo: 'Reels', postEmoji: '🔥' },
  { postLegenda: 'Como saber se é a hora de começar', postTipo: 'Foto', postEmoji: '🧘' },
];

function AutomacaoEditor({ rule, store, onClose, onTest }) {
  const [post, setPost] = React.useState(rule ? { postLegenda: rule.postLegenda, postTipo: rule.postTipo, postEmoji: rule.postEmoji } : MOCK_POSTS[0]);
  const [keywords, setKeywords] = React.useState(rule ? [...rule.keywords] : ['QUERO']);
  const [kwInput, setKwInput] = React.useState('');
  const [dmMensagem, setDmMensagem] = React.useState(rule ? rule.dmMensagem : 'Oi! Que bom que você comentou 🌿 Aqui é o link pra você responder 2 perguntinhas e já marcar comigo:');
  const [dmBotao, setDmBotao] = React.useState(rule ? rule.dmBotao : 'Marcar minha sessão');
  const [pub, setPub] = React.useState(rule ? rule.respostaPublica : true);
  const [pubTexto, setPubTexto] = React.useState(rule ? rule.respostaPublicaTexto : 'Te chamei no direct! 💚');

  const addKw = (v) => { const k = (v || kwInput).trim().toUpperCase(); if (k && !keywords.includes(k)) setKeywords([...keywords, k]); setKwInput(''); };
  const built = () => ({ id: rule?.id || ('auto_' + Math.random().toString(36).slice(2, 7)), ativa: rule ? rule.ativa : true, ...post, keywords, respostaPublica: pub, respostaPublicaTexto: pubTexto, dmMensagem, dmBotao, stats: rule ? rule.stats : { comentarios: 0, dms: 0, leads: 0 } });
  const save = () => { Store.saveAutomation(built()); Store.toast(rule ? 'Automação atualizada ✓' : 'Automação criada ✓'); onClose(); };

  return (
    <Overlay onClose={onClose} title={rule ? 'Editar automação' : 'Nova automação'} wide
      footer={<div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <Button variant="outline" onClick={() => onTest(built())} icon="bolt">Testar</Button>
        <Button full onClick={save} icon="check">{rule ? 'Salvar' : 'Criar automação'}</Button>
      </div>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* post picker */}
        <div>
          <SectionLabel style={{ marginBottom: 9 }}>1 · Em qual post?</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 9 }}>
            {MOCK_POSTS.map((p) => {
              const on = p.postLegenda === post.postLegenda;
              return (
                <button key={p.postLegenda} onClick={() => setPost(p)} style={{ display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', padding: 10, borderRadius: 12, border: `2px solid ${on ? 'var(--accent)' : 'var(--line)'}`, background: on ? 'var(--accent-050)' : 'var(--card)' }}>
                  <InstaPostThumb rule={p} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)' }}>{p.postTipo}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.postLegenda}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* keywords */}
        <div>
          <SectionLabel style={{ marginBottom: 9 }}>2 · Palavra-chave do comentário</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', border: '1.5px solid var(--line)', borderRadius: 12, padding: 10, background: 'var(--card)' }}>
            {keywords.map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-050)', padding: '6px 10px', borderRadius: 8 }}>
                {k}<button onClick={() => setKeywords(keywords.filter((x) => x !== k))} style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="x" size={13} sw={2.5} /></button>
              </span>
            ))}
            <input value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addKw())} placeholder="+ palavra" style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font)', minWidth: 90, flex: 1, background: 'transparent', textTransform: 'uppercase' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 7 }}>Quem comentar qualquer uma dessas palavras recebe a DM. Enter pra adicionar.</div>
        </div>

        {/* public reply */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <SectionLabel>3 · Resposta pública no comentário</SectionLabel>
            <Toggle on={pub} onClick={() => setPub(!pub)} />
          </div>
          {pub && <Field value={pubTexto} onChange={setPubTexto} placeholder="Te chamei no direct! 💚" />}
        </div>

        {/* DM */}
        <div>
          <SectionLabel style={{ marginBottom: 9 }}>4 · Mensagem da DM</SectionLabel>
          <Field as="textarea" rows={3} value={dmMensagem} onChange={setDmMensagem} />
          <div style={{ marginTop: 10 }}>
            <Field label="Texto do botão (abre o bio-funil)" value={dmBotao} onChange={setDmBotao} icon="link" />
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ---- live simulator (comment → DM) -------------------------------------- */
function CommentDMSim({ rule, store, onClose }) {
  const [comments, setComments] = React.useState([
    { user: 'ana.luagomes', text: 'Que conteúdo lindo 😍', reply: false },
    { user: 'pedro.hss', text: 'Precisava ouvir isso hoje', reply: false },
  ]);
  const [draft, setDraft] = React.useState('');
  const [dm, setDm] = React.useState(null); // {stage:'typing'|'sent'}
  const [matched, setMatched] = React.useState(false);
  const me = 'voce.exemplo';
  const kw = rule.keywords[0];

  const send = (txt) => {
    const text = (txt || draft).trim();
    if (!text) return;
    setDraft('');
    const hit = rule.keywords.some((k) => text.toUpperCase().includes(k));
    setComments((c) => [...c, { user: me, text, reply: false, mine: true }]);
    if (hit && !matched) {
      setMatched(true);
      Store.captureComment(rule.id);
      // public reply
      if (rule.respostaPublica) {
        setTimeout(() => setComments((c) => [...c, { user: 'osvaldo.terapia', text: `@${me} ${rule.respostaPublicaTexto}`, reply: true, pro: true }]), 700);
      }
      // DM
      setTimeout(() => setDm({ stage: 'typing' }), 1100);
      setTimeout(() => setDm({ stage: 'sent' }), 2100);
    } else if (!hit) {
      setTimeout(() => Store.toast(`Sem a palavra "${kw}" — nada é enviado.`), 200);
    }
  };

  return (
    <Overlay onClose={onClose} title="Simulação ao vivo" wide
      sub="Comente a palavra-chave e veja a DM sair sozinha.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        {/* LEFT — Instagram post */}
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="instagram" size={15} /> No Instagram</div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', background: 'var(--card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 12 }}>
              <Avatar name="Osvaldo Reis" size={32} />
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>osvaldo.terapia</div>
              <span style={{ marginLeft: 'auto', color: 'var(--faint)' }}><Icon name="dots" size={16} /></span>
            </div>
            <div style={{ height: 150, background: 'linear-gradient(135deg, #2A5D52, #0E8A6B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 8 }}>
              <span style={{ fontSize: 44 }}>{rule.postEmoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, opacity: .9, padding: '0 20px', textAlign: 'center', lineHeight: 1.3 }}>{rule.postLegenda}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 13px', color: 'var(--ink)' }}>
              <Icon name="heart" size={22} /><Icon name="chat" size={21} /><Icon name="send" size={21} />
              <span style={{ marginLeft: 'auto', color: 'var(--ink)' }}><Icon name="bookmark" size={21} /></span>
            </div>
            {/* comments */}
            <div style={{ borderTop: '1px solid var(--line-soft)', padding: '8px 13px 12px', maxHeight: 190, overflowY: 'auto' }} className="no-sb">
              {comments.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, padding: '6px 0', animation: c.mine || c.reply ? 'fadeUp .3s both' : 'none' }}>
                  <Avatar name={c.user} size={26} bg={c.pro ? 'var(--accent)' : '#C9C3B6'} fg="#fff" style={{ marginTop: 1 }} />
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.user}</span>{' '}
                    <span style={{ color: 'var(--text)' }}>{c.text}</span>
                    {c.pro && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6, fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}><Icon name="bolt" size={11} /> auto</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* comment composer */}
            <div style={{ borderTop: '1px solid var(--line-soft)', padding: 10 }}>
              {!matched && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {rule.keywords.map((k) => <button key={k} onClick={() => send(k)} style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-800)', background: 'var(--accent-050)', border: '1px solid var(--accent-100)', padding: '5px 10px', borderRadius: 16 }}>Comentar “{k}”</button>)}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Adicione um comentário…" style={{ flex: 1, border: '1.5px solid var(--line)', borderRadius: 22, padding: '9px 14px', fontSize: 13.5, outline: 'none', fontFamily: 'var(--font)', color: 'var(--ink)' }} />
                <button onClick={() => send()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="send" size={17} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — the DM */}
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="send" size={14} /> Na DM do lead</div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', background: '#EBE7DF', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 12, background: 'var(--card)', borderBottom: '1px solid var(--line)' }}>
              <Avatar name="Osvaldo Reis" size={30} />
              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>osvaldo.terapia</div>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="bolt" size={12} /> automático</span>
            </div>
            <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: dm ? 'flex-start' : 'center' }}>
              {!dm && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px 10px' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,.6)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Icon name="send" size={26} /></div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, maxWidth: 220, margin: '0 auto' }}>A DM aparece aqui assim que alguém comentar <b style={{ color: 'var(--accent-800)' }}>{kw}</b>.</div>
                </div>
              )}
              {dm?.stage === 'typing' && (
                <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '13px 16px', borderRadius: 16, borderBottomLeftRadius: 5, boxShadow: 'var(--sh-sm)' }}><TypingDots /></div>
              )}
              {dm?.stage === 'sent' && (
                <>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '90%', background: '#fff', padding: '11px 14px', borderRadius: 16, borderBottomLeftRadius: 5, fontSize: 14, lineHeight: 1.45, color: 'var(--ink)', boxShadow: 'var(--sh-sm)', animation: 'popIn .3s both' }}>{rule.dmMensagem}</div>
                  <div style={{ alignSelf: 'flex-start', maxWidth: '90%', width: '100%', animation: 'popIn .3s .1s both' }}>
                    <button onClick={() => Store.toast('Abrindo o bio-funil… (vira lead no app)')} style={{ width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--sh-sm)' }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="link" size={18} /></span>
                      <span style={{ textAlign: 'left', flex: 1 }}><span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{rule.dmBotao}</span><span style={{ fontSize: 11.5, opacity: .85 }}>agendai.com.br/f/{store.funnel.slug}</span></span>
                      <Icon name="chevRight" size={18} />
                    </button>
                  </div>
                  <div style={{ alignSelf: 'center', marginTop: 6, fontSize: 12, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.7)', padding: '6px 12px', borderRadius: 20, animation: 'popIn .3s .2s both' }}><Icon name="checkCircle" size={14} /> DM enviada automaticamente</div>
                </>
              )}
            </div>
          </div>
          {matched && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.45, display: 'flex', gap: 8 }}><span style={{ color: 'var(--accent)', flexShrink: 0 }}><Icon name="arrowRight" size={15} /></span> Quando o lead toca no botão, cai no seu funil — qualifica, agenda e vira um lead no app. Tudo conectado.</div>}
        </div>
      </div>
    </Overlay>
  );
}

/* ---- generic overlay ----------------------------------------------------- */
function Overlay({ children, title, sub, footer, onClose, wide }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(21,33,28,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn .18s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg)', borderRadius: 20, width: '100%', maxWidth: wide ? 720 : 460, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--sh-lg)', animation: 'popIn .26s both', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px 22px 14px', borderBottom: '1px solid var(--line)', background: 'var(--card)' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 19, letterSpacing: '-.02em' }}>{title}</h3>
            {sub && <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '4px 0 0' }}>{sub}</p>}
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 22, overflowY: 'auto' }} className="no-sb">{children}</div>
        {footer && <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', background: 'var(--card)' }}>{footer}</div>}
      </div>
    </div>
  );
}

Object.assign(window, { InstaAutomacoes, AutomacaoCard, AutomacaoEditor, CommentDMSim, Overlay, InstaPostThumb });
