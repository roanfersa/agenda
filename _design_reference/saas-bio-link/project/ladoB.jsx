/* ===========================================================================
   ladoB.jsx — Funil público conversacional (o lead / seguidor)
   Mobile-first chat. Reads funnel config from the store, and on completion
   creates a real lead (+ appointment) that shows up in Lado A and Lado C.
   =========================================================================== */

function ChatBubble({ from, children, delay = 0 }) {
  const bot = from === 'bot';
  return (
    <div style={{ display: 'flex', justifyContent: bot ? 'flex-start' : 'flex-end', animation: `popIn .34s ${delay}s both` }}>
      <div style={{
        maxWidth: '82%', padding: '11px 14px', fontSize: 15, lineHeight: 1.45, fontWeight: 500,
        background: bot ? '#fff' : 'var(--accent)', color: bot ? 'var(--ink)' : '#fff',
        borderRadius: 18, borderBottomLeftRadius: bot ? 5 : 18, borderBottomRightRadius: bot ? 18 : 5,
        boxShadow: bot ? '0 1px 2px rgba(21,33,28,.07)' : '0 1px 3px rgba(14,138,107,.3)',
      }}>{children}</div>
    </div>
  );
}

function QuickReplies({ options, onPick }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', animation: 'fadeUp .3s .1s both' }}>
      {options.map((o, i) => (
        <button key={i} onClick={() => onPick(o)} style={{
          padding: '11px 16px', borderRadius: 22, background: '#fff', border: '1.5px solid var(--accent-200)',
          color: 'var(--accent-800)', fontWeight: 700, fontSize: 14.5, boxShadow: 'var(--sh-sm)',
          transition: 'transform .1s, background .15s',
        }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.96)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >{o}</button>
      ))}
    </div>
  );
}

function LadoB({ onExit, modeOverride, objOverride }) {
  const { funnel, professional, disponibilidade } = useStore();
  const objetivo = objOverride || funnel.objetivo || 'agendar';
  const obj = OBJ(objetivo);
  const pro = professional;

  const [msgs, setMsgs] = React.useState([]);     // {from, text|node, key}
  const [stage, setStage] = React.useState('boot');
  const [typing, setTyping] = React.useState(false);
  const [answers, setAnswers] = React.useState([]); // {perguntaId, pergunta, valor}
  const [sched, setSched] = React.useState(null);   // {dia, hora, ...}
  const [pickDay, setPickDay] = React.useState(0);
  const [nome, setNome] = React.useState('');
  const [whats, setWhats] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  const [intent, setIntent] = React.useState(obj.sched ? 'agendar' : 'whats');
  const [showPriv, setShowPriv] = React.useState(false);
  const campos = funnel.camposContato || { email: false, whatsapp: true };
  const contatoQuando = funnel.contatoQuando || 'fim';
  const contatoDoneRef = React.useRef(false);
  const contactAfterRef = React.useRef(null);
  const [reservaSeg, setReservaSeg] = React.useState(null); // segundos restantes da reserva provisória
  const scrollRef = React.useRef(null);
  const idRef = React.useRef(0);
  const key = () => 'm' + (idRef.current++);

  const scrollDown = () => { const el = scrollRef.current; if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; }); };
  React.useEffect(scrollDown, [msgs, stage, typing, pickDay]);

  // contagem regressiva da reserva provisória do horário (10 min)
  React.useEffect(() => {
    if (reservaSeg === null || stage === 'done') return;
    if (reservaSeg <= 0) {
      setReservaSeg(null); setSched(null);
      botSay('Ih, sua reserva de 10 min expirou 😅 Escolhe outro horário:', () => setStage('schedule'));
      return;
    }
    const t = setTimeout(() => setReservaSeg((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [reservaSeg, stage]);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // push a bot message after a typing delay; chain with callback
  const botSay = (node, after, gap = 700) => {
    setTyping(true); scrollDown();
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: 'bot', node, key: key() }]);
      if (after) setTimeout(after, 380);
    }, gap);
  };
  const userSay = (text) => setMsgs((m) => [...m, { from: 'user', node: text, key: key() }]);

  // ---- flow control ------------------------------------------------------
  const startedRef = React.useRef(false);
  React.useEffect(() => {
    if (startedRef.current) return; startedRef.current = true;
    botSay(funnel.mensagemBoasVindas, () => askQuestion(0), 600);
  }, []);

  function askQuestion(i) {
    if (i >= funnel.perguntas.length) { route(); return; }
    const q = funnel.perguntas[i];
    botSay(<span>{q.texto} <span style={{ color: 'var(--faint)', fontSize: 12.5, fontWeight: 700 }}>· {i + 1} de {funnel.perguntas.length}</span></span>, () => setStage('q' + i));
  }
  function answerQuestion(i, val) {
    const q = funnel.perguntas[i];
    userSay(val);
    setAnswers((a) => [...a, { perguntaId: q.id, pergunta: q.texto, valor: val }]);
    setStage('wait');
    setTimeout(() => {
      // 'inicio' (contato após 1ª pergunta) só vale pra objetivos SEM agenda.
      // No modo Agendar o contato é fixo: logo após o slot, dentro da reserva.
      if (i === 0 && contatoQuando === 'inicio' && !obj.sched && !contatoDoneRef.current) {
        askContact(() => askQuestion(i + 1));
      } else {
        askQuestion(i + 1);
      }
    }, 250);
  }

  function route() {
    // Caminho primário sempre tenta concluir o objetivo. Sem opção paralela de escape.
    if (obj.sched) { setIntent('agendar'); botSay('Boa! Esses são os horários livres 👇', () => setStage('schedule')); return; }
    setIntent('whats');
    afterQualified();
  }
  // contact (if at end / sempre no modo agendar) then consent
  function afterQualified() {
    // No modo Agendar o contato é sempre pedido aqui (após o slot, dentro da reserva).
    if ((obj.sched || contatoQuando === 'fim') && !contatoDoneRef.current) {
      const prompt = objetivo === 'qualificar' ? 'Boa! Pra eu te encaminhar pro time, deixa seu contato 👇'
        : intent === 'agendar' ? 'Pra confirmar o horário, deixa seu contato 👇'
        : 'Me deixa seu contato que eu já te chamo 👇';
      askContact(() => goConsent(), prompt);
    } else {
      goConsent();
    }
  }
  function goConsent() { botSay('Última coisa, rapidinho 👇', () => setStage('consent')); }

  // WhatsApp como FALLBACK, depois de uma tentativa de agendamento
  function fallbackWhats() {
    userSay('Não achei um horário bom');
    setIntent('whats'); setReservaSeg(null); setSched(null); setStage('wait');
    setTimeout(() => botSay('Sem problema! Me deixa seu contato que a gente acha um horário juntos 👇', () => afterQualified()), 250);
  }

  function pickSlot(dia, hora) {
    const d = disponibilidade[dia];
    setSched({ dia: d.dia, diaRotulo: d.rotulo, hora });
    userSay(`${d.dia.split(',')[0]} às ${hora}`);
    setStage('wait');
    setReservaSeg(600); // reserva provisória de 10 min enquanto o lead conclui
    setTimeout(() => botSay(<span>Reservei <b>{d.dia}, {hora}</b> pra você por <b>10 min</b> 👍 Agora é só confirmar.</span>, () => afterQualified()), 280);
  }

  // ---- contact form -----------------------------------------------------
  function askContact(after, prompt) {
    contactAfterRef.current = after;
    const p = prompt || (intent === 'agendar' ? 'Pra confirmar, deixa seu contato 👇'
      : objetivo === 'qualificar' ? 'Antes, deixa seu contato pro time falar com você 👇'
      : 'Me deixa seu contato 👇');
    botSay(p, () => setStage('contact'));
  }
  function submitContact() {
    const parts = [nome.trim()];
    if (campos.email && email.trim()) parts.push(email.trim());
    if (campos.whatsapp && whats.replace(/\D/g, '').length >= 10) parts.push(fmtWhats('55' + whats.replace(/\D/g, '').slice(-11)));
    userSay(parts.join(' · '));
    contatoDoneRef.current = true;
    setStage('wait');
    const after = contactAfterRef.current;
    setTimeout(() => { if (after) after(); }, 300);
  }

  function finalize() {
    if (!consent) return;
    const respList = answers.map((a) => a.valor).join(', ');
    const modal = answers.find((a) => /presencial|online/i.test(a.valor))?.valor || '';
    const modalidade = /presencial/i.test(modal) ? 'presencial' : 'online';
    const tipo = answers[0]?.valor || 'Atendimento';
    let resumo, agendamento = null;
    if (intent === 'agendar' && sched) {
      const dd = '1' + (8 + pickDay);
      agendamento = { dia: sched.dia, dataHora: `${dd}/06/2026 ${sched.hora}`, hora: sched.hora, tipo, modalidade };
      resumo = `${respList}. Agendou para ${sched.dia}, ${sched.hora}.`;
    } else if (objetivo === 'qualificar') {
      resumo = `${respList}. Lead qualificado — encaminhar pro time de vendas.`;
    } else if (objetivo === 'vender') {
      resumo = `${respList}. Interesse de compra — seguiu pro WhatsApp pra fechar.`;
    } else {
      resumo = `${respList}. Pediu pra continuar no WhatsApp.`;
    }
    const d = whats.replace(/\D/g, ''); const w55 = campos.whatsapp && d.length >= 10 ? '55' + d.slice(-11) : '';
    setReservaSeg(null);
    Store.addLeadFromFunnel({ nome: nome.trim(), whatsapp: w55, email: campos.email ? email.trim() : '', respostas: answers, resumoIA: resumo, agendamento, origem: 'instagram', funnelId: funnel.id });
    userSay('✓ Autorizo o contato');
    setStage('wait');
    const done = intent === 'agendar' ? <span>Prontinho, <b>{nome.split(' ')[0]}</b>! Sua sessão tá marcada. Te enviei tudo no WhatsApp 💬</span>
      : objetivo === 'qualificar' ? <span>Valeu, <b>{nome.split(' ')[0]}</b>! Já te encaminhei pro nosso time de vendas — em breve falam com você 💬</span>
      : objetivo === 'vender' ? <span>Show, <b>{nome.split(' ')[0]}</b>! Te chamo no WhatsApp pra a gente fechar 💬</span>
      : <span>Prontinho, <b>{nome.split(' ')[0]}</b>! É só continuar a conversa por lá 💬</span>;
    setTimeout(() => botSay(done, () => setStage('done')), 400);
  }

  // ---- WhatsApp handoff text --------------------------------------------
  const waText = () => {
    const resp = answers.map((a) => a.valor).join(', ');
    let t = `Oi! Sou ${nome.split(' ')[0] || 'eu'}, vim pelo seu link.`;
    if (objetivo === 'qualificar') t += ` Meu interesse: ${resp}.`;
    else if (objetivo === 'vender') t += ` Quero comprar — ${resp}.`;
    else if (sched && intent === 'agendar') t += ` Marquei ${sched.dia}, ${sched.hora}. (${resp})`;
    else t += ` ${resp}.`;
    return t + ' 🌿';
  };

  // ---- header ------------------------------------------------------------
  const header = (
    <div style={{ background: 'var(--accent)', padding: '4px 16px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
      <Avatar name={pro.nome} size={42} bg="rgba(255,255,255,.22)" fg="#fff" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', fontFamily: 'var(--font-display)' }}>{pro.nome}</div>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pro.especialidade} · {pro.atende}</div>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.18)', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '5px 9px', borderRadius: 20 }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: '#7CF0C8' }} /> online
      </span>
    </div>
  );

  // ---- composer area (per stage) ----------------------------------------
  let composer = null;
  if (stage.startsWith('q')) {
    const i = +stage.slice(1); const q = funnel.perguntas[i];
    composer = q.tipo === 'opcoes'
      ? <QuickReplies options={q.opcoes} onPick={(v) => answerQuestion(i, v)} />
      : <ChatInput placeholder="Digite aqui…" onSend={(v) => answerQuestion(i, v)} />;
  } else if (stage === 'schedule') {
    composer = <Scheduler disp={disponibilidade} pickDay={pickDay} setPickDay={setPickDay} onPick={pickSlot} onFallback={fallbackWhats} />;
  } else if (stage === 'contact') {
    composer = <ContactForm campos={campos} nome={nome} setNome={setNome} email={email} setEmail={setEmail} whats={whats} setWhats={setWhats} onSubmit={submitContact} cta={contatoQuando === 'inicio' ? 'Continuar' : (intent === 'agendar' ? 'Confirmar' : obj.cta)} />;
  } else if (stage === 'consent') {
    composer = (
      <div style={{ animation: 'fadeUp .3s both', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1.5px solid var(--line)' }}>
          <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', cursor: 'pointer' }}>
            <span onClick={() => setConsent(!consent)} style={{
              width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1,
              border: `2px solid ${consent ? 'var(--accent)' : 'var(--line)'}`, background: consent ? 'var(--accent)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all .15s',
            }}>{consent && <Icon name="check" size={15} sw={3} />}</span>
            <span onClick={() => setConsent(!consent)} style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>
              {funnel.consentimentoTexto}{' '}
              <button onClick={(e) => { e.stopPropagation(); setShowPriv(true); }} style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>Ler aviso</button>
            </span>
          </label>
        </div>
        <Button full size="lg" disabled={!consent} onClick={finalize} icon="checkCircle">
          {intent === 'agendar' ? 'Confirmar agendamento' : obj.cta}
        </Button>
      </div>
    );
  } else if (stage === 'done') {
    composer = (
      <div style={{ animation: 'fadeUp .3s both', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {intent === 'agendar' && sched && (
          <div style={{ background: '#fff', border: '1.5px solid var(--accent-200)', borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="calendar" size={24} /></div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14.5 }}>{sched.dia}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>às {sched.hora} · {/presencial/i.test(answers[1]?.valor || '') ? 'Presencial' : 'Online'}</div>
            </div>
          </div>
        )}
        <a href={waLink(pro.whatsapp, waText())} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
          <Button full size="lg" variant="whats" icon="whatsapp">{intent === 'agendar' ? 'Abrir no WhatsApp' : obj.cta}</Button>
        </a>
        <button onClick={onExit} style={{ color: 'var(--muted)', fontSize: 13.5, fontWeight: 600, padding: 8 }}>Voltar ao protótipo</button>
      </div>
    );
  }

  return (
    <Phone header={header} statusDark bg="#EBE7DF" safeBg="var(--accent)">
      <div style={{ padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map((m) => <ChatBubble key={m.key} from={m.from}>{m.node}</ChatBubble>)}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#fff', padding: '13px 16px', borderRadius: 18, borderBottomLeftRadius: 5, boxShadow: '0 1px 2px rgba(21,33,28,.07)' }}><TypingDots /></div>
          </div>
        )}
      </div>
      {composer && (
        <div style={{ padding: '6px 14px 18px' }}>
          {reservaSeg !== null && intent === 'agendar' && ['contact', 'consent'].includes(stage) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 10, animation: 'fadeUp .3s both', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--accent-050)', border: '1px solid var(--accent-200)', color: 'var(--accent-800)', borderRadius: 20, padding: '7px 12px', fontSize: 12.5, fontWeight: 700 }}>
                <Icon name="clock" size={14} /> Horário reservado · {mmss(reservaSeg)}
              </span>
              <button onClick={() => setReservaSeg(0)} style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: 2 }}>simular expiração</button>
            </div>
          )}
          {composer}
        </div>
      )}

      {showPriv && <PrivacySheet text={funnel.consentimentoTexto} pro={pro} campos={campos} onClose={() => setShowPriv(false)} />}
    </Phone>
  );
}

/* ---- contact form (nome + email + whatsapp, per config) ----------------- */
function ContactForm({ campos, nome, setNome, email, setEmail, whats, setWhats, onSubmit, cta }) {
  const emailOk = !campos.email || /\S+@\S+\.\S+/.test(email);
  const whatsOk = !campos.whatsapp || whats.replace(/\D/g, '').length >= 10;
  const valid = nome.trim() && emailOk && whatsOk;
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1.5px solid var(--line)', animation: 'fadeUp .3s both', display: 'flex', flexDirection: 'column', gap: 11 }}>
      <Field value={nome} onChange={setNome} placeholder="Seu nome" icon="user" autoFocus />
      {campos.email && <Field value={email} onChange={setEmail} placeholder="seu@email.com" icon="chat" type="email" />}
      {campos.whatsapp && <Field value={whats} onChange={setWhats} placeholder="(11) 9 9999-9999" prefix="+55" icon="whatsapp" type="tel" />}
      <Button full size="lg" disabled={!valid} onClick={onSubmit} iconRight="arrowRight">{cta || 'Continuar'}</Button>
    </div>
  );
}

/* ---- chat text input ----------------------------------------------------- */
function ChatInput({ placeholder, onSend, value, setValue, onSubmit, cta = 'OK', type = 'text', mask }) {
  const [local, setLocal] = React.useState('');
  const val = setValue ? value : local;
  const set = setValue || setLocal;
  const submit = () => {
    if (!val || !val.trim()) return;
    if (onSubmit) onSubmit(); else { onSend(val.trim()); setLocal(''); }
  };
  const onChange = (v) => { set(mask ? v : v); };
  return (
    <div style={{ display: 'flex', gap: 8, animation: 'fadeUp .3s both' }}>
      <div style={{ flex: 1, background: '#fff', borderRadius: 24, border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 6px 0 16px' }}>
        <input autoFocus value={val} type={type} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15.5, fontWeight: 500, color: 'var(--ink)', height: 48, fontFamily: 'var(--font)' }} />
        <button onClick={submit} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="send" size={19} style={{ marginLeft: -1 }} />
        </button>
      </div>
    </div>
  );
}

/* ---- inline scheduler ---------------------------------------------------- */
function Scheduler({ disp, pickDay, setPickDay, onPick, onFallback }) {
  const day = disp[pickDay];
  return (
    <div style={{ animation: 'fadeUp .3s both' }}>
    <div style={{ background: '#fff', borderRadius: 18, padding: 14, border: '1.5px solid var(--line)' }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 4 }} className="no-sb">
        {disp.map((d, i) => {
          const on = i === pickDay;
          return (
            <button key={d.id} onClick={() => setPickDay(i)} style={{
              padding: '9px 14px', borderRadius: 12, flexShrink: 0, fontWeight: 700, fontSize: 13.5,
              background: on ? 'var(--accent)' : 'var(--bg)', color: on ? '#fff' : 'var(--text)',
              border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`, transition: 'all .15s',
            }}>{i === 0 ? 'Hoje' : d.rotulo}</button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {day.horarios.map((h) => (
          <button key={h} onClick={() => onPick(pickDay, h)} style={{
            padding: '13px 0', borderRadius: 12, background: 'var(--accent-050)', color: 'var(--accent-800)',
            border: '1.5px solid var(--accent-100)', fontWeight: 700, fontSize: 15, transition: 'all .12s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-050)'; e.currentTarget.style.color = 'var(--accent-800)'; }}
          >{h}</button>
        ))}
      </div>
    </div>
    {onFallback && (
      <button onClick={onFallback} style={{ width: '100%', marginTop: 10, textAlign: 'center', color: 'var(--muted)', fontWeight: 600, fontSize: 13, padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        Nenhum horário bom? <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Falar no WhatsApp</span>
      </button>
    )}
    </div>
  );
}

/* ---- privacy sheet ------------------------------------------------------- */
function PrivacySheet({ text, pro, campos, onClose }) {
  const fields = ['nome'].concat(campos?.email ? ['e-mail'] : [], campos?.whatsapp ? ['WhatsApp'] : []);
  const lista = fields.length > 1 ? fields.slice(0, -1).join(', ') + ' e ' + fields[fields.length - 1] : fields[0];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(21,33,28,.42)', display: 'flex', alignItems: 'flex-end', animation: 'fadeIn .2s both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '20px 20px 32px', width: '100%', animation: 'slideUp .3s cubic-bezier(.2,.8,.3,1) both', maxHeight: '78%', overflowY: 'auto' }} className="no-sb">
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--line)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="shield" size={22} /></span>
          <h3 style={{ fontSize: 18 }}>Aviso de privacidade</h3>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', margin: '0 0 14px' }}>{text}</p>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>
          <p style={{ margin: '0 0 10px' }}><b style={{ color: 'var(--ink)' }}>O que coletamos:</b> {lista}, além das respostas de logística que você escolheu acima.</p>
          <p style={{ margin: '0 0 10px' }}><b style={{ color: 'var(--ink)' }}>Pra quê:</b> agendar e confirmar seu atendimento com {pro.nome}.</p>
          <p style={{ margin: 0 }}><b style={{ color: 'var(--ink)' }}>Seus direitos:</b> você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento.</p>
        </div>
        <div style={{ marginTop: 20 }}><Button full onClick={onClose}>Entendi</Button></div>
      </div>
    </div>
  );
}

Object.assign(window, { LadoB, ChatBubble, QuickReplies, ChatInput, ContactForm, Scheduler, PrivacySheet });
