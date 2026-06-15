/* ===========================================================================
   app.jsx — shell: prototype chrome, screen-map index, side switcher, mount
   =========================================================================== */

function Logo({ size = 28, light }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.32, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24"><path d="M5 13l4 4 10-11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.62, letterSpacing: '-.02em', color: light ? '#fff' : 'var(--ink)' }}>Agendaí</span>
    </div>
  );
}

/* ---- prototype top chrome ------------------------------------------------ */
function TopChrome({ side, setSide }) {
  const tabs = [
    { id: 'mapa', label: 'Mapa de telas', icon: 'map' },
    { id: 'A', label: 'App do profissional', icon: 'phone' },
    { id: 'B', label: 'Funil público', icon: 'chat' },
    { id: 'C', label: 'Backoffice', icon: 'grid' },
  ];
  return (
    <div style={{
      height: 56, background: '#1B231F', borderBottom: '1px solid rgba(255,255,255,.08)',
      display: 'flex', alignItems: 'center', gap: 18, padding: '0 18px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Logo size={26} light />
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.12)' }} />
      <div style={{ display: 'flex', gap: 4 }}>
        {tabs.map((t) => {
          const on = side === t.id;
          return (
            <button key={t.id} onClick={() => setSide(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10,
              fontSize: 13.5, fontWeight: 700, transition: 'all .15s',
              background: on ? 'rgba(255,255,255,.12)' : 'transparent',
              color: on ? '#fff' : 'rgba(255,255,255,.55)',
            }}>
              <Icon name={t.icon} size={17} />{t.label}
            </button>
          );
        })}
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: '#3FC892' }} /> Protótipo navegável · v1
      </div>
    </div>
  );
}

/* ---- phone stage (centers the device) ------------------------------------ */
function PhoneStage({ caption, children }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', gap: 18 }}>
      <div style={{ transform: 'scale(.92)', transformOrigin: 'center' }}>{children}</div>
      {caption && <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, fontWeight: 600 }}>{caption}</div>}
    </div>
  );
}

/* ---- device/desktop view toggle (floating) ------------------------------- */
function ViewToggle({ view, setView }) {
  const opts = [['phone', 'Celular', 'phone'], ['desktop', 'Desktop', 'grid']];
  return (
    <div style={{ position: 'fixed', top: 70, right: 28, zIndex: 90, display: 'flex', gap: 3, background: 'rgba(27,35,31,.86)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 11, padding: 4, border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}>
      {opts.map(([id, label, icon]) => {
        const on = view === id;
        return (
          <button key={id} onClick={() => setView(id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: on ? 'rgba(255,255,255,.16)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.55)', transition: 'all .15s',
          }}><Icon name={icon} size={16} />{label}</button>
        );
      })}
    </div>
  );
}

/* ===========================================================================
   MAPA DE TELAS
   =========================================================================== */
function Mapa({ go }) {
  const s = useStore();
  const sides = [
    {
      id: 'A', accent: 'var(--accent)', icon: 'phone', titulo: 'App do profissional', tag: 'Mobile · quem paga',
      desc: 'Cria o funil com a IA, conecta a agenda, recebe e gerencia os leads e agendamentos.',
      telas: [
        { l: 'Entrar / Cadastro', screen: 'entrar' }, { l: 'Onboarding — perfil + criar funil (IA ou manual)', screen: 'onboarding' },
        { l: 'Início (dashboard)', screen: 'inicio' }, { l: 'Leads', screen: 'leads' }, { l: 'Detalhe do lead', screen: 'leadDetail' },
        { l: 'Agenda', screen: 'agenda' }, { l: 'Funis (vários funis)', screen: 'funis' }, { l: 'Editar funil', screen: 'funil' },
        { l: 'Automações do Instagram', screen: 'automacoes' }, { l: 'Configurações', screen: 'config' }, { l: 'Planos', screen: 'planos' },
      ],
    },
    {
      id: 'B', accent: '#0E8A6B', icon: 'chat', titulo: 'Funil público', tag: 'Mobile · o lead',
      desc: 'A conversa que substitui o “link na bio”: qualifica em 2–3 toques e agenda, vende ou encaminha pro time.',
      telas: [
        { l: 'Objetivo: Agendar', obj: 'agendar' }, { l: 'Objetivo: Qualificar pra vendas (SDR)', obj: 'qualificar' }, { l: 'Objetivo: Capturar contato', obj: 'capturar' },
      ],
    },
    {
      id: 'C', accent: '#2F6DB3', icon: 'grid', titulo: 'Backoffice', tag: 'Desktop · sua equipe',
      desc: 'Operação interna: profissionais, planos, fila de setups assistidos, LGPD e equipe.',
      telas: [
        { l: 'Login interno', screen: 'entrar' }, { l: 'Visão geral', screen: 'overview' }, { l: 'Profissionais', screen: 'profissionais' },
        { l: 'Detalhe da conta', screen: 'detalhe' }, { l: 'Fila de setups', screen: 'setups' }, { l: 'Assinaturas', screen: 'assinaturas' },
        { l: 'LGPD', screen: 'lgpd' }, { l: 'Equipe interna', screen: 'equipe' },
      ],
    },
  ];
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: 'var(--bg)', overflowY: 'auto' }}>
      {/* hero */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '52px 28px 8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-050)', color: 'var(--accent-800)', padding: '7px 13px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
          <Icon name="sparkles" size={15} /> Bio-funil que agenda · MVP v1
        </div>
        <h1 style={{ fontSize: 'clamp(34px, 5vw, 52px)', lineHeight: 1.04, letterSpacing: '-.03em', maxWidth: 760, marginBottom: 18 }}>
          O fim do <span style={{ color: 'var(--accent)' }}>“chama no direct”</span>.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.55, maxWidth: 620, margin: 0, fontWeight: 500 }}>
          O seguidor clica no link da bio, responde 2–3 perguntas e <b style={{ color: 'var(--text)' }}>sai com a consulta marcada</b> — ou cai no seu WhatsApp já qualificado, com um resumo pronto.
        </p>
      </div>

      {/* three sides */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 28px 64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 22 }}>
        {sides.map((sd) => (
          <div key={sd.id} style={{ background: '#fff', borderRadius: 'var(--r-xl)', border: '1px solid var(--line)', boxShadow: 'var(--sh)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: sd.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-sm)' }}><Icon name={sd.icon} size={24} /></div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Lado {sd.id} · {sd.tag}</div>
                  <h3 style={{ fontSize: 20, letterSpacing: '-.02em' }}>{sd.titulo}</h3>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{sd.desc}</p>
            </div>
            <div style={{ padding: 12, flex: 1 }}>
              {sd.telas.map((t, i) => (
                <button key={i} onClick={() => go(sd.id, t)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                  textAlign: 'left', fontSize: 14, fontWeight: 600, color: 'var(--text)', transition: 'background .14s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--bg)', color: sd.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{t.l}</span>
                  <span style={{ color: 'var(--faint)' }}><Icon name="chevRight" size={16} /></span>
                </button>
              ))}
            </div>
            <div style={{ padding: 16, borderTop: '1px solid var(--line-soft)' }}>
              <Button full variant="dark" iconRight="arrowRight" onClick={() => go(sd.id, sd.telas[sd.id === 'A' ? 2 : 0] || sd.telas[0])}>Abrir {sd.titulo}</Button>
            </div>
          </div>
        ))}
      </div>

      {/* flow note */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px 72px' }}>
        <div style={{ background: 'var(--ink)', borderRadius: 'var(--r-xl)', padding: '26px 30px', color: '#fff', display: 'flex', gap: 26, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px' }}>
            <h3 style={{ color: '#fff', fontSize: 19, marginBottom: 8 }}>Tudo conectado, de ponta a ponta</h3>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
              Complete o funil público e o lead aparece <b style={{ color: '#fff' }}>na hora</b> no Início, em Leads e na Agenda do Osvaldo — e a conta dele já está lá no Backoffice.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {['Funil público', 'Leads novos', 'Agenda', 'Backoffice'].map((x, i) => (
              <React.Fragment key={x}>
                {i > 0 && <Icon name="arrowRight" size={18} style={{ color: 'rgba(255,255,255,.35)' }} />}
                <span style={{ background: 'rgba(255,255,255,.1)', padding: '8px 13px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{x}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   APP ROOT
   =========================================================================== */
function App() {
  const [side, setSide] = React.useState('mapa');
  const [aStart, setAStart] = React.useState('inicio');
  const [aKey, setAKey] = React.useState(0);
  const [aView, setAView] = React.useState('phone');
  const [bObj, setBObj] = React.useState(null);
  const [bKey, setBKey] = React.useState(0);
  const [cStart, setCStart] = React.useState('overview');

  const go = (sd, t) => {
    if (sd === 'A') { setAStart(t.screen || 'inicio'); setAKey((k) => k + 1); if (t.screen === 'entrar' || t.screen === 'onboarding') setAView('phone'); }
    if (sd === 'B') { setBObj(t.obj || null); setBKey((k) => k + 1); }
    if (sd === 'C') { setCStart(t.screen || 'overview'); }
    setSide(sd);
  };

  // desktop has no login/onboarding screens — map mobile-only screens sensibly
  const dMap = { entrar: 'inicio', onboarding: 'inicio', leadDetail: 'leads', funis: 'funil', funil: 'funil' };
  const desktopStart = dMap[aStart] || aStart;

  return (
    <div>
      <TopChrome side={side} setSide={(x) => { setSide(x); if (x === 'B') setBKey((k) => k + 1); }} />
      {side === 'mapa' && <Mapa go={go} />}
      {side === 'A' && (
        <div>
          <ViewToggle view={aView} setView={setAView} />
          {aView === 'phone'
            ? <PhoneStage caption="Lado A — App do profissional (Osvaldo)"><LadoA key={aKey} start={aStart} /></PhoneStage>
            : <LadoADesktop key={'d' + aKey} start={desktopStart} />}
        </div>
      )}
      {side === 'B' && <PhoneStage caption="Lado B — Funil público · toque para responder"><LadoB key={bKey} objOverride={bObj} onExit={() => setSide('mapa')} /></PhoneStage>}
      {side === 'C' && <LadoC start={cStart} />}
      <ToastHost />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
