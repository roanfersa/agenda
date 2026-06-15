/* ===========================================================================
   ui.jsx — shared primitives, icon set, store hook, device + desktop chrome
   =========================================================================== */

/* ---- store hook ---------------------------------------------------------- */
function useStore(selector) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => Store.subscribe(force), []);
  const s = Store.getState();
  return selector ? selector(s) : s;
}

/* ---- Icon set (stroke, currentColor) ------------------------------------- */
function Icon({ name, size = 20, sw = 1.75, style, fill }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" {...p} /><path d="M5 9.5V20h14V9.5" {...p} /><path d="M9.5 20v-5.5h5V20" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.2" {...p} /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...p} /><path d="M16 6.2A3 3 0 0 1 16 12M16.5 14.2c2.4.3 4 2.2 4 4.8" {...p} /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>,
    funnel: <><path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5" {...p} /></>,
    card: <><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" {...p} /><path d="M2.5 9.5h19" {...p} /></>,
    link: <><path d="M9.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" {...p} /><path d="M14.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" {...p} /></>,
    copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" {...p} /><path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...p} /></>,
    share: <><circle cx="6" cy="12" r="2.5" {...p} /><circle cx="17" cy="6" r="2.5" {...p} /><circle cx="17" cy="18" r="2.5" {...p} /><path d="M8.2 10.8 14.8 7.2M8.2 13.2 14.8 16.8" {...p} /></>,
    whatsapp: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.6L4 20Z" {...p} /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1.2-.4 1.2-1l-.1-1.1-2-.6-.9.9c-1-.4-1.8-1.2-2.2-2.2l.9-.9-.6-2-1.1-.1c-.6 0-1 .6-1 1.2Z" fill="currentColor" stroke="none" /></>,
    check: <><path d="M5 12.5 10 17l9-10" {...p} /></>,
    checkCircle: <><circle cx="12" cy="12" r="9" {...p} /><path d="M8.5 12.2 11 14.7l4.6-5" {...p} /></>,
    chevRight: <><path d="M9 5l7 7-7 7" {...p} /></>,
    chevLeft: <><path d="M15 5l-7 7 7 7" {...p} /></>,
    chevDown: <><path d="M5 9l7 7 7-7" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    search: <><circle cx="11" cy="11" r="6.5" {...p} /><path d="M20 20l-3.5-3.5" {...p} /></>,
    sparkles: <><path d="M12 3.5 13.7 9 19 10.7 13.7 12.4 12 18 10.3 12.4 5 10.7 10.3 9 12 3.5Z" {...p} /><path d="M18.5 4v3M20 5.5h-3M5.5 16v2.5M6.75 17.25h-2.5" {...p} /></>,
    google: <g><path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" fill="#4285F4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" /><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" fill="#FBBC05" /><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.4 3-4.1 5.6-4.1Z" fill="#EA4335" /></g>,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...p} /><circle cx="12" cy="12" r="4" {...p} /><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" /></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" {...p} /></>,
    arrowLeft: <><path d="M19 12H5M11 6l-6 6 6 6" {...p} /></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p} /><path d="M10 19a2 2 0 0 0 4 0" {...p} /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" {...p} /></>,
    edit: <><path d="M14 5.5 18.5 10 8 20.5l-4.5 1 1-4.5L14 5.5Z" {...p} /><path d="M13 6.5 17.5 11" {...p} /></>,
    grip: <><circle cx="9" cy="7" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="7" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="17" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="1.3" fill="currentColor" stroke="none" /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    trash: <><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" {...p} /></>,
    lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" {...p} /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...p} /></>,
    shield: <><path d="M12 3 5 5.5V11c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V5.5L12 3Z" {...p} /><path d="M9 11.5 11 13.5l4-4" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7v5l3.5 2" {...p} /></>,
    dots: <><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" /></>,
    video: <><rect x="2.5" y="6" width="13" height="12" rx="2.5" {...p} /><path d="m15.5 10 6-3v10l-6-3" {...p} /></>,
    mappin: <><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></>,
    send: <><path d="M4 12 20 4l-6 16-3-7-7-1Z" {...p} /></>,
    bolt: <><path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" {...p} /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="2" {...p} /></>,
    logout: <><path d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" {...p} /><path d="M10 12h11M18 9l3 3-3 3" {...p} /></>,
    alert: <><path d="M12 3 22 20H2L12 3Z" {...p} /><path d="M12 10v4M12 17v.5" {...p} /></>,
    money: <><rect x="2.5" y="6" width="19" height="12" rx="2.5" {...p} /><circle cx="12" cy="12" r="2.6" {...p} /><path d="M6 9.5v5M18 9.5v5" {...p} /></>,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" {...p} /></>,
    moon: <><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" {...p} /></>,
    phone: <><path d="M5 4h4l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" {...p} /></>,
    user: <><circle cx="12" cy="8" r="3.6" {...p} /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" {...p} /></>,
    camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1Z" {...p} /><circle cx="12" cy="13" r="3.2" {...p} /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5" {...p} /><path d="M4 13a8 8 0 0 0 14 4.5L20 15M20 20v-5h-5" {...p} /></>,
    chat: <><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z" {...p} /></>,
    map: <><path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" {...p} /><path d="M9 4v14M15 6v14" {...p} /></>,
    heart: <><path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.5 0 5 3.5 3.5 6.5-2.5 4.5-9.5 9-9.5 9Z" {...p} /></>,
    bookmark: <><path d="M6 4h12v17l-6-4-6 4V4Z" {...p} /></>,
    bolt2: <><path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" {...p} /></>,
    tag: <><path d="M3 12.5 11.5 4H20v8.5L11.5 21 3 12.5Z" {...p} /><circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" /></>,
    target: <><circle cx="12" cy="12" r="8.5" {...p} /><circle cx="12" cy="12" r="4.5" {...p} /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    wand: <><path d="M4 20 16 8M14 6l4 4M18 3v3M21 5h-3M19.5 9.5 21 11" {...p} /></>,
    pencilPlus: <><path d="M14 5.5 18.5 10 8 20.5l-4.5 1 1-4.5L14 5.5Z" {...p} /><path d="M13 6.5 17.5 11" {...p} /></>,
    file: <><path d="M6 3h8l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" {...p} /><path d="M13 3v5h5" {...p} /></>,
    paperclip: <><path d="M18 7.5 9.5 16a3 3 0 0 1-4.2-4.2l8-8a4.5 4.5 0 0 1 6.4 6.4l-8.2 8.2a6 6 0 0 1-8.5-8.5" {...p} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...style }} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
}

/* ---- Avatar -------------------------------------------------------------- */
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}
function Avatar({ name, size = 40, src, bg = 'var(--accent)', fg = '#fff', style }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: src ? `center/cover url(${src})` : bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font)', fontWeight: 700, fontSize: size * 0.38, letterSpacing: '.01em',
      ...style,
    }}>
      {!src && initials(name)}
    </div>
  );
}

/* ---- Badge / status pill ------------------------------------------------- */
const STATUS = {
  novo: { t: 'Novo', bg: 'var(--accent-100)', fg: 'var(--accent-800)' },
  agendado: { t: 'Agendado', bg: 'var(--info-bg)', fg: 'var(--info)' },
  em_conversa: { t: 'Em conversa', bg: 'var(--amber-bg)', fg: 'var(--amber-ink)' },
  ativo: { t: 'Ativo', bg: 'var(--accent-100)', fg: 'var(--accent-800)' },
  trial: { t: 'Trial', bg: 'var(--info-bg)', fg: 'var(--info)' },
  inadimplente: { t: 'Inadimplente', bg: 'var(--danger-bg)', fg: 'var(--danger-ink)' },
  cancelado: { t: 'Cancelado', bg: '#EEECE6', fg: '#7C857E' },
  em_dia: { t: 'Em dia', bg: 'var(--accent-100)', fg: 'var(--accent-800)' },
  atrasado: { t: 'Atrasado', bg: 'var(--danger-bg)', fg: 'var(--danger-ink)' },
  pendente: { t: 'Pendente', bg: 'var(--amber-bg)', fg: 'var(--amber-ink)' },
  concluido: { t: 'Concluído', bg: 'var(--accent-100)', fg: 'var(--accent-800)' },
  solicitado: { t: 'Solicitado', bg: '#EEECE6', fg: '#7C857E' },
  em_montagem: { t: 'Em montagem', bg: 'var(--info-bg)', fg: 'var(--info)' },
  aguardando_cliente: { t: 'Aguardando cliente', bg: 'var(--amber-bg)', fg: 'var(--amber-ink)' },
};
function Badge({ status, children, bg, fg, dot, style }) {
  const s = STATUS[status];
  const _bg = bg || s?.bg || '#EEECE6';
  const _fg = fg || s?.fg || '#7C857E';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: _bg, color: _fg,
      fontWeight: 700, fontSize: 12, lineHeight: 1, padding: '5px 9px', borderRadius: 8,
      whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 6, background: _fg }} />}
      {children || s?.t || status}
    </span>
  );
}

/* ---- Button -------------------------------------------------------------- */
function Button({ children, onClick, variant = 'primary', size = 'md', icon, iconRight, full, disabled, style }) {
  const [hover, setHover] = React.useState(false);
  const sizes = {
    sm: { h: 36, px: 14, fs: 13.5, gap: 6, ic: 16 },
    md: { h: 46, px: 18, fs: 15, gap: 8, ic: 18 },
    lg: { h: 54, px: 22, fs: 16.5, gap: 9, ic: 20 },
  }[size];
  const variants = {
    primary: { background: disabled ? '#C4D8D0' : (hover ? 'var(--accent-700)' : 'var(--accent)'), color: '#fff', boxShadow: disabled ? 'none' : 'var(--sh-sm)' },
    dark: { background: hover ? '#0c1714' : 'var(--ink)', color: '#fff' },
    soft: { background: hover ? 'var(--accent-100)' : 'var(--accent-050)', color: 'var(--accent-800)' },
    ghost: { background: hover ? 'var(--line-soft)' : 'transparent', color: 'var(--ink)' },
    outline: { background: hover ? 'var(--line-soft)' : 'var(--card)', color: 'var(--ink)', border: '1.5px solid var(--line)' },
    danger: { background: hover ? '#b53a31' : 'var(--danger)', color: '#fff' },
    whats: { background: hover ? '#0c7c5c' : 'var(--accent)', color: '#fff' },
  }[variant];
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: 12, fontWeight: 700,
        fontSize: sizes.fs, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: sizes.gap, width: full ? '100%' : undefined, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .16s, transform .1s', letterSpacing: '-.01em', ...variants, ...style,
      }}
    >
      {icon && <Icon name={icon} size={sizes.ic} sw={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.ic} sw={2} />}
    </button>
  );
}

/* ---- Card ---------------------------------------------------------------- */
function Card({ children, style, onClick, pad = 16, hover: hoverable }) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setH(true)} onMouseLeave={() => hoverable && setH(false)}
      style={{
        background: 'var(--card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)',
        padding: pad, boxShadow: h ? 'var(--sh)' : 'var(--sh-sm)', cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .18s, transform .12s, border-color .18s',
        transform: h ? 'translateY(-1px)' : 'none', borderColor: h ? 'var(--accent-200)' : 'var(--line)',
        ...style,
      }}
    >{children}</div>
  );
}

/* ---- Progress bar -------------------------------------------------------- */
function Progress({ value, style }) {
  return (
    <div style={{ height: 6, background: 'var(--line)', borderRadius: 6, overflow: 'hidden', ...style }}>
      <div style={{ height: '100%', width: `${Math.round(value * 100)}%`, background: 'var(--accent)', borderRadius: 6, transition: 'width .45s cubic-bezier(.2,.8,.3,1)' }} />
    </div>
  );
}

/* ---- Toast --------------------------------------------------------------- */
function ToastHost() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      background: 'var(--ink)', color: '#fff', padding: '12px 18px', borderRadius: 12,
      fontSize: 14, fontWeight: 600, boxShadow: 'var(--sh-lg)', display: 'flex', alignItems: 'center', gap: 9,
      animation: 'popIn .3s both', maxWidth: 360,
    }}>
      <span style={{ color: 'var(--accent-200)', display: 'flex' }}><Icon name="checkCircle" size={18} /></span>
      {toast.msg}
    </div>
  );
}

/* ---- Field (text input) -------------------------------------------------- */
function Field({ label, value, onChange, placeholder, type = 'text', hint, icon, prefix, as, rows = 3, style, autoFocus }) {
  const [focus, setFocus] = React.useState(false);
  const Tag = as === 'textarea' ? 'textarea' : 'input';
  return (
    <label style={{ display: 'block', ...style }}>
      {label && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 7 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: as === 'textarea' ? 'flex-start' : 'center', gap: 9,
        background: 'var(--card)', border: `1.5px solid ${focus ? 'var(--accent)' : 'var(--line)'}`,
        borderRadius: 12, padding: as === 'textarea' ? '12px 14px' : '0 14px', height: as === 'textarea' ? 'auto' : 50,
        transition: 'border-color .15s, box-shadow .15s', boxShadow: focus ? '0 0 0 4px var(--accent-050)' : 'none',
      }}>
        {icon && <span style={{ color: 'var(--faint)', display: 'flex' }}><Icon name={icon} size={19} /></span>}
        {prefix && <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 15 }}>{prefix}</span>}
        <Tag
          value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
          type={type} rows={as === 'textarea' ? rows : undefined} autoFocus={autoFocus}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            border: 'none', outline: 'none', background: 'transparent', flex: 1, width: '100%',
            fontSize: 15.5, color: 'var(--ink)', fontFamily: 'var(--font)', fontWeight: 500,
            resize: as === 'textarea' ? 'vertical' : undefined, lineHeight: as === 'textarea' ? 1.5 : undefined,
            padding: as === 'textarea' ? 0 : '14px 0',
          }}
        />
      </div>
      {hint && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.4 }}>{hint}</div>}
    </label>
  );
}

/* ---- Typing dots --------------------------------------------------------- */
function TypingDots({ color = 'var(--muted)' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: 7, background: color, animation: `dot 1.2s ${i * 0.18}s infinite` }} />
      ))}
    </span>
  );
}

/* ---- Empty state --------------------------------------------------------- */
function EmptyState({ icon = 'sparkles', title, body, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent-050)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon name={icon} size={30} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
      {body && <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto 18px' }}>{body}</div>}
      {action}
    </div>
  );
}

/* ---- Phone shell — wraps IOSDevice with product chrome ------------------- */
// header: optional element rendered fixed under the status bar
// tabbar: optional element rendered fixed above the home indicator
// statusDark: true => white status-bar glyphs (for colored safe area)
function Phone({ children, header, tabbar, statusDark = false, bg = 'var(--bg)', safeBg = 'var(--card)', scrollRef, onScroll }) {
  return (
    <IOSDevice dark={statusDark}>
      {/* safe-area tint behind the status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, background: safeBg, zIndex: 9 }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: bg }}>
        {header && <div style={{ paddingTop: 54, background: safeBg, flexShrink: 0, position: 'relative', zIndex: 8 }}>{header}</div>}
        {!header && <div style={{ height: 54, flexShrink: 0 }} />}
        <div ref={scrollRef} onScroll={onScroll} className="no-sb" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
          {children}
          <div style={{ height: tabbar ? 92 : 30 }} />
        </div>
        {tabbar && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30 }}>
            {tabbar}
          </div>
        )}
      </div>
    </IOSDevice>
  );
}

/* ---- Mobile top header --------------------------------------------------- */
function AppHeader({ title, left, right, sub, dark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '6px 18px 14px',
      background: dark ? 'var(--accent)' : 'var(--card)', color: dark ? '#fff' : 'var(--ink)',
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, letterSpacing: '-.02em', color: dark ? '#fff' : 'var(--ink)' }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,.85)' : 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---- Round icon button --------------------------------------------------- */
function RoundBtn({ icon, onClick, badge, dark, size = 40 }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: size, height: size, borderRadius: 12, position: 'relative',
        background: dark ? (h ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.14)') : (h ? 'var(--line-soft)' : 'var(--bg)'),
        color: dark ? '#fff' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .15s', flexShrink: 0,
      }}>
      <Icon name={icon} size={20} />
      {badge ? <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 9, background: 'var(--danger)', color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--card)' }}>{badge}</span> : null}
    </button>
  );
}

/* ---- Mobile tab bar ------------------------------------------------------ */
function TabBar({ active, onChange, badge }) {
  const tabs = [
    { id: 'inicio', icon: 'home', label: 'Início' },
    { id: 'leads', icon: 'users', label: 'Leads' },
    { id: 'agenda', icon: 'calendar', label: 'Agenda' },
    { id: 'config', icon: 'settings', label: 'Ajustes' },
  ];
  return (
    <div style={{
      background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--line)', paddingBottom: 26, paddingTop: 9,
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? 'var(--accent)' : 'var(--faint)', position: 'relative', flex: 1,
          }}>
            <div style={{ position: 'relative' }}>
              <Icon name={t.icon} size={24} sw={on ? 2.1 : 1.8} />
              {t.id === 'leads' && badge ? <span style={{ position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8, background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span> : null}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---- Section label ------------------------------------------------------- */
function SectionLabel({ children, style }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', ...style }}>{children}</div>;
}

/* ---- helpers ------------------------------------------------------------- */
function fmtWhats(raw) {
  const d = (raw || '').replace(/\D/g, '');
  if (d.length < 12) return raw;
  const cc = d.slice(0, 2), ddd = d.slice(2, 4), p1 = d.slice(4, 9), p2 = d.slice(9, 13);
  return `+${cc} (${ddd}) ${p1}-${p2}`;
}
function waLink(whats, text) {
  return `https://wa.me/${(whats || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

Object.assign(window, {
  useStore, Icon, Avatar, initials, Badge, STATUS, Button, Card, Progress,
  ToastHost, Field, TypingDots, EmptyState, Phone, AppHeader, RoundBtn, TabBar,
  SectionLabel, fmtWhats, waLink,
});
