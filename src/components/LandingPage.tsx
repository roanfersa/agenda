import * as React from "react";

const ACCENT = "var(--accent)";

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: ACCENT,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontFamily: "var(--font-display)",
          fontSize: 17,
        }}
      >
        R
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: "var(--ink)" }}>Revo</span>
    </div>
  );
}

function Step({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "26px 24px" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--accent-050)",
          color: "var(--accent-800)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        {n}
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)", margin: "0 0 7px" }}>{titulo}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--muted)", margin: 0 }}>{texto}</p>
    </div>
  );
}

function Feature({ emoji, titulo, texto }: { emoji: string; titulo: string; texto: string }) {
  return (
    <div style={{ padding: "4px 2px" }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{emoji}</div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16.5, color: "var(--ink)", margin: "0 0 6px" }}>{titulo}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--muted)", margin: 0 }}>{texto}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100dvh" }}>
      {/* NAV */}
      <header
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Logo />
        <nav style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 22 }}>
          <a href="#como-funciona" className="hide-sm" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted)", textDecoration: "none" }}>
            Como funciona
          </a>
          <a href="#recursos" className="hide-sm" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--muted)", textDecoration: "none" }}>
            Recursos
          </a>
          <a href="/entrar" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}>
            Entrar
          </a>
          <a
            href="/entrar"
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: "#fff",
              background: ACCENT,
              padding: "9px 16px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Começar grátis
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "48px 22px 36px", textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 12.5,
            fontWeight: 800,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--accent-800)",
            background: "var(--accent-050)",
            border: "1px solid var(--accent-100)",
            padding: "6px 13px",
            borderRadius: 20,
            marginBottom: 22,
          }}
        >
          Para profissionais autônomos
        </span>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 6vw, 52px)",
            lineHeight: 1.08,
            letterSpacing: "-.02em",
            margin: "0 0 18px",
            color: "var(--ink)",
          }}
        >
          Transforme comentários e DMs do Instagram em clientes agendados.
        </h1>
        <p style={{ fontSize: "clamp(16px, 2.4vw, 19px)", lineHeight: 1.55, color: "var(--muted)", maxWidth: 620, margin: "0 auto 28px" }}>
          O Revo cria sua página de bio-link, responde automaticamente quem comenta nos seus posts e conduz a
          conversa até virar um lead qualificado — sem você precisar ficar online o tempo todo.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/entrar"
            style={{ fontSize: 15.5, fontWeight: 700, color: "#fff", background: ACCENT, padding: "13px 24px", borderRadius: 12, textDecoration: "none" }}
          >
            Começar grátis
          </a>
          <a
            href="#como-funciona"
            style={{
              fontSize: 15.5,
              fontWeight: 700,
              color: "var(--ink)",
              background: "var(--card)",
              border: "1px solid var(--line)",
              padding: "13px 24px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            Ver como funciona
          </a>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 22px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 32px)", textAlign: "center", color: "var(--ink)", margin: "0 0 8px" }}>
          Do comentário ao agendamento, no automático
        </h2>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 16, maxWidth: 560, margin: "0 auto 34px" }}>
          Você conecta seu Instagram uma vez. O Revo cuida do resto.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          <Step
            n={1}
            titulo="Alguém comenta a palavra-chave"
            texto="Um seguidor comenta uma palavra que você escolheu (ex.: “EU QUERO”) em uma publicação sua no Instagram."
          />
          <Step
            n={2}
            titulo="O Revo responde na hora"
            texto="Automaticamente, o Revo responde ao comentário e envia uma mensagem direta com o link do seu funil — em nome da sua conta."
          />
          <Step
            n={3}
            titulo="Você atende e agenda"
            texto="A pessoa responde algumas perguntas no funil e você assume a conversa pelo inbox do Revo para fechar o atendimento."
          />
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" style={{ maxWidth: 1080, margin: "0 auto", padding: "44px 22px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 32px)", textAlign: "center", color: "var(--ink)", margin: "0 0 34px" }}>
          Tudo num só lugar
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "30px 26px" }}>
          <Feature emoji="🔗" titulo="Página de bio-link" texto="Monte em minutos a página do seu @ com seus links, serviços e um funil de conversa." />
          <Feature emoji="💬" titulo="Automação comentário → DM" texto="Responda automaticamente quem comenta nos seus posts e leve a conversa para a DM." />
          <Feature emoji="🙋" titulo="Atendimento humano" texto="Um inbox dentro do Revo para você responder pessoalmente as conversas iniciadas pelos contatos." />
          <Feature emoji="✨" titulo="Funis com inteligência artificial" texto="A IA monta e conduz funis de qualificação com base nos seus materiais e serviços." />
          <Feature emoji="🎯" titulo="Captação e qualificação de leads" texto="Cada contato vira um lead organizado, com resumo automático e próximos passos." />
          <Feature emoji="📈" titulo="Acompanhamento" texto="Veja comentários respondidos, mensagens enviadas e leads gerados em um painel simples." />
        </div>
      </section>

      {/* INTEGRAÇÃO INSTAGRAM (transparência p/ usuário e revisor) */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 22px 44px" }}>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: "clamp(24px, 5vw, 40px)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 3.5vw, 28px)", color: "var(--ink)", margin: "0 0 12px" }}>
            Integração oficial e segura com o Instagram
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--muted)", maxWidth: 760, margin: "0 0 18px" }}>
            Você conecta sua conta profissional do Instagram à Revo com o login oficial do Instagram. A Revo usa a API
            oficial apenas para executar as automações que você mesmo configura:
          </p>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 10, maxWidth: 760 }}>
            {[
              "Ler os comentários das suas próprias publicações para identificar a palavra-chave.",
              "Responder ao comentário e enviar uma mensagem direta com o link do seu funil.",
              "Ler e responder mensagens diretas pelo inbox de atendimento humano.",
            ].map((t) => (
              <li key={t} style={{ display: "flex", gap: 10, fontSize: 15, color: "var(--ink)", lineHeight: 1.5 }}>
                <span style={{ color: ACCENT, fontWeight: 800 }}>✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--faint)", marginTop: 18, marginBottom: 0 }}>
            Seus dados são isolados e usados apenas para operar o serviço. Você pode desconectar sua conta a qualquer
            momento. Saiba mais na nossa <a href="/privacidade" style={{ color: "var(--accent-800)" }}>Política de Privacidade</a> e nas{" "}
            <a href="/exclusao-de-dados" style={{ color: "var(--accent-800)" }}>instruções de exclusão de dados</a>.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "20px 22px 56px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 34px)", color: "var(--ink)", margin: "0 0 14px" }}>
          Comece a captar clientes hoje
        </h2>
        <p style={{ fontSize: 16, color: "var(--muted)", margin: "0 0 24px" }}>
          Crie sua conta gratuitamente e conecte seu Instagram em poucos minutos.
        </p>
        <a
          href="/entrar"
          style={{ fontSize: 16, fontWeight: 700, color: "#fff", background: ACCENT, padding: "14px 30px", borderRadius: 12, textDecoration: "none", display: "inline-block" }}
        >
          Criar conta grátis
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--line)", background: "var(--card)" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "28px 22px",
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            alignItems: "center",
          }}
        >
          <Logo />
          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap", marginLeft: "auto" }}>
            <a href="/privacidade" style={{ fontSize: 13.5, color: "var(--muted)", textDecoration: "none" }}>Privacidade</a>
            <a href="/termos" style={{ fontSize: 13.5, color: "var(--muted)", textDecoration: "none" }}>Termos</a>
            <a href="/exclusao-de-dados" style={{ fontSize: 13.5, color: "var(--muted)", textDecoration: "none" }}>Exclusão de dados</a>
            <a href="/entrar" style={{ fontSize: 13.5, color: "var(--muted)", textDecoration: "none" }}>Entrar</a>
          </nav>
        </div>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 22px 28px", fontSize: 12.5, color: "var(--faint)", lineHeight: 1.6 }}>
          <b style={{ color: "var(--muted)" }}>Revo</b> é um produto de <b style={{ color: "var(--muted)" }}>LEVERPEAK LTDA</b> — CNPJ 67.097.696/0001-97.<br />
          Av. Paulista, 1636, conj. 4, sala 1504 — Bela Vista, São Paulo/SP — CEP 01.310-200. Contato:{" "}
          <a href="mailto:atendimento@leverpeak.com.br" style={{ color: "var(--muted)" }}>atendimento@leverpeak.com.br</a>.
        </div>
      </footer>
    </div>
  );
}
