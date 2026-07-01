"use client";

import * as React from "react";
import { Button, Card, Field, SectionLabel } from "./ui";
import { Icon } from "./Icon";
import { FunilEditor } from "./FunilEditor";
import { LadoB } from "./LadoB";
import { AiFunnelChat } from "./AiFunnelChat";
import { useStore, uuid } from "@/lib/store";
import { hasFeature } from "@/lib/features";
import { FLOW_PRESETS, presetQuestions } from "@/lib/flow-presets";
import { uploadBranding } from "@/lib/upload";
import {
  DEFAULT_THEME,
  type FlowPreset,
  type FunnelBlock,
  type FunnelTheme,
  type SocialLink,
} from "@/lib/types";

/** Bloco cru vindo da IA (campos frouxos) → normalizado pro formato real do FunnelBlock. */
type AiBlock = {
  tipo?: string;
  titulo?: string;
  descricao?: string;
  preco?: string;
  url?: string;
  emoji?: string;
  texto?: string;
  cta?: string;
  links?: SocialLink[];
};

/** Garante que todo bloco gerado pela IA tenha os campos que o editor/render esperam. */
function normalizeAiBlock(b: AiBlock): FunnelBlock {
  const id = uuid();
  const emoji = typeof b.emoji === "string" ? b.emoji : undefined;
  switch (b.tipo) {
    case "texto":
      return { id, tipo: "texto", texto: b.texto || b.titulo || "" };
    case "social":
      return { id, tipo: "social", links: Array.isArray(b.links) ? b.links : [] };
    case "oferta":
      return { id, tipo: "oferta", titulo: b.titulo || "", descricao: b.descricao, preco: b.preco, url: b.url || "", emoji };
    case "recurso":
      return { id, tipo: "recurso", titulo: b.titulo || "", descricao: b.descricao, url: b.url || "", emoji };
    case "recomendador":
      return { id, tipo: "recomendador", titulo: b.titulo || "Não sabe por onde começar?", cta: b.cta || "Me ajuda a escolher" };
    case "funil":
      return { id, tipo: "funil", titulo: b.titulo || "", cta: b.cta || "Começar" };
    case "link":
    default:
      return { id, tipo: "link", titulo: b.titulo || b.texto || "Link", url: b.url || "", emoji };
  }
}

type Tab = "identidade" | "blocos" | "funil" | "recursos" | "previa";

const FONTES = ["Plus Jakarta Sans", "Poppins", "Inter", "Georgia", "system-ui"];
const REDES = ["Instagram", "TikTok", "YouTube", "LinkedIn", "Facebook", "X", "Site"];

export function BioLinkEditor() {
  const funnel = useStore((s) => s.funnel);
  const professional = useStore((s) => s.professional);
  const updateFunnel = useStore((s) => s.updateFunnel);
  const toast = useStore((s) => s.toast);

  const podeBranding = hasFeature(professional, "branding");
  const podeBlocos = hasFeature(professional, "blocos_links");
  const podeGerar = hasFeature(professional, "gerar_ia");

  const [tab, setTab] = React.useState<Tab>("identidade");
  const [theme, setTheme] = React.useState<FunnelTheme>({ ...DEFAULT_THEME, ...(funnel.theme || {}) });
  const [blocks, setBlocks] = React.useState<FunnelBlock[]>(funnel.blocks || []);
  const [flowPreset, setFlowPreset] = React.useState<FlowPreset>(funnel.flowPreset || "bio_quiz");
  const [gerando, setGerando] = React.useState(false);
  const [uploading, setUploading] = React.useState<string | null>(null);

  // Funil "ao vivo" pra prévia (mescla edições locais).
  const previewFunnel = { ...funnel, theme, blocks, flowPreset };

  const salvar = () => {
    updateFunnel({ theme, blocks, flowPreset });
    toast("Alterações salvas ✓");
  };
  const publicar = () => {
    updateFunnel({ theme, blocks, flowPreset, status: "publicado" });
    toast("Página publicada ✓");
  };
  const copiarRascunho = () => {
    const url = `${window.location.origin}/p/${funnel.previewToken}`;
    navigator.clipboard?.writeText(url);
    toast("Link de rascunho copiado");
  };

  const setTk = (patch: Partial<FunnelTheme>) => setTheme((t) => ({ ...t, ...patch }));

  const upload = async (campo: "logoUrl" | "avatarUrl" | "bgImageUrl", file?: File) => {
    if (!file) return;
    setUploading(campo);
    try {
      const url = await uploadBranding(professional.id, file);
      setTk({ [campo]: url } as Partial<FunnelTheme>);
    } catch {
      toast("Falha no upload da imagem");
    } finally {
      setUploading(null);
    }
  };

  const gerarComIA = async () => {
    if (gerando) return;
    setGerando(true);
    try {
      const res = await fetch("/api/ai/page-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objetivo: funnel.objetivo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Não foi possível gerar com IA.");
        return;
      }
      setFlowPreset(data.flowPreset || "bio_quiz");
      setTk({ brandColor: data.brandColor || theme.brandColor, headline: data.headline || "", subheadline: data.subheadline || "" });
      if (Array.isArray(data.blocks)) {
        setBlocks(data.blocks.map((b: AiBlock) => normalizeAiBlock(b)));
      }
      // Aplica boas-vindas/perguntas no funil também.
      if (data.boasVindas || Array.isArray(data.perguntas)) {
        updateFunnel({
          mensagemBoasVindas: data.boasVindas || funnel.mensagemBoasVindas,
          ...(Array.isArray(data.perguntas) && data.perguntas.length
            ? { perguntas: data.perguntas.map((q: { texto: string; tipo: "opcoes" | "texto_livre"; opcoes?: string[]; obrigatoria: boolean }) => ({ ...q, id: uuid() })) }
            : {}),
        });
      }
      toast("Página gerada com IA ✨ — revise e salve.");
    } catch {
      toast("Erro de conexão com a IA.");
    } finally {
      setGerando(false);
    }
  };

  // ---- Blocos ----
  const addBlock = (tipo: FunnelBlock["tipo"]) => {
    const base = { id: uuid() };
    const novo: FunnelBlock =
      tipo === "social"
        ? { ...base, tipo: "social", links: [{ rede: "Instagram", url: "" }] }
        : tipo === "texto"
          ? { ...base, tipo: "texto", texto: "Texto livre" }
          : tipo === "link"
            ? { ...base, tipo: "link", titulo: "Novo link", url: "" }
            : tipo === "oferta"
              ? { ...base, tipo: "oferta", titulo: "Nova oferta", url: "", preco: "" }
              : tipo === "recomendador"
                ? { ...base, tipo: "recomendador", titulo: "Não sabe por onde começar?", cta: "Me ajude a escolher" }
                : tipo === "whatsapp"
                  ? { ...base, tipo: "whatsapp", titulo: "Fale comigo", numero: professional.whatsapp || "", cta: "Iniciar conversa →" }
                  : tipo === "embed"
                    ? { ...base, tipo: "embed", provedor: "youtube", url: "" }
                    : tipo === "instagram"
                      ? { ...base, tipo: "instagram", titulo: "No meu Instagram" }
                      : { ...base, tipo: "recurso", titulo: "Novo recurso", url: "" };
    setBlocks((b) => [...b, novo]);
  };
  const patchBlock = (id: string, patch: Partial<FunnelBlock>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...patch } as FunnelBlock) : b)));
  const uploadBlockImage = async (id: string, file?: File) => {
    if (!file) return;
    setUploading("bloco-" + id);
    try {
      const url = await uploadBranding(professional.id, file);
      patchBlock(id, { imagemUrl: url } as Partial<FunnelBlock>);
    } catch {
      toast("Falha no upload da imagem");
    } finally {
      setUploading(null);
    }
  };
  const removeBlock = (id: string) => setBlocks((bs) => bs.filter((b) => b.id !== id));
  const moveBlock = (i: number, dir: -1 | 1) =>
    setBlocks((bs) => {
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const copy = [...bs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const tabs: [Tab, string][] = [
    ["identidade", "Identidade"],
    ["blocos", "Blocos"],
    ["funil", "Funil"],
    ["recursos", "Recursos"],
    ["previa", "Prévia"],
  ];

  return (
    <div style={{ padding: "0 16px" }} className="lg:px-0 lg:max-w-5xl lg:mx-auto">
      {/* Top bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {podeGerar && (
          <Button size="sm" icon="bolt" onClick={gerarComIA} disabled={gerando}>
            {gerando ? "Gerando…" : "Gerar com IA"}
          </Button>
        )}
        <Button size="sm" variant="outline" icon="copy" onClick={copiarRascunho}>Link de rascunho</Button>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="outline" onClick={salvar}>Salvar</Button>
        <Button size="sm" icon="check" onClick={publicar}>Publicar</Button>
      </div>

      {/* Modo da página */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel style={{ marginBottom: 6 }}>Modo da página</SectionLabel>
        <div style={{ display: "flex", gap: 8 }}>
          {([
            ["pagina", "Página", "Blocos (links, produtos, WhatsApp…) + botão de chat"],
            ["conversa", "Só conversa", "Abre direto no chat com IA"],
          ] as const).map(([id, label, desc]) => {
            const on = (funnel.pageMode ?? "conversa") === id;
            return (
              <button key={id} onClick={() => updateFunnel({ pageMode: id })}
                style={{ flex: 1, textAlign: "left", padding: "10px 12px", borderRadius: 12,
                  border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  background: on ? "var(--accent-050)" : "var(--card)" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: on ? "var(--accent-800)" : "var(--ink)" }}>{label}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--bg)", borderRadius: 12, padding: 4, marginBottom: 18, border: "1px solid var(--line)", overflowX: "auto" }}>
        {tabs.map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: "1 0 auto", padding: "9px 14px", borderRadius: 9, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap",
              background: tab === id ? "var(--card)" : "transparent", color: tab === id ? "var(--ink)" : "var(--muted)", boxShadow: tab === id ? "var(--sh-sm)" : "none" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6 lg:items-start">
        <div>
          {tab === "identidade" && (!podeBranding ? <Bloqueado nome="Identidade visual" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <SectionLabel style={{ marginBottom: 8 }}>Cor da marca</SectionLabel>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={theme.brandColor} onChange={(e) => setTk({ brandColor: e.target.value })} style={{ width: 48, height: 40, border: "none", background: "none" }} />
                  <Field value={theme.brandColor} onChange={(v) => setTk({ brandColor: v })} />
                </div>
              </div>
              <div>
                <SectionLabel style={{ marginBottom: 8 }}>Fonte</SectionLabel>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {FONTES.map((f) => (
                    <button key={f} onClick={() => setTk({ fontFamily: f })}
                      style={{ padding: "8px 12px", borderRadius: 10, fontFamily: f, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${theme.fontFamily === f ? "var(--accent)" : "var(--line)"}`,
                        background: theme.fontFamily === f ? "var(--accent-050)" : "var(--card)", color: theme.fontFamily === f ? "var(--accent-800)" : "var(--muted)" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Headline" value={theme.headline} onChange={(v) => setTk({ headline: v })} placeholder="Ex.: responda 3 perguntas e descubra…" />
              <Field label="Subtítulo" value={theme.subheadline} onChange={(v) => setTk({ subheadline: v })} placeholder="Prova social, etc." />
              <div>
                <SectionLabel style={{ marginBottom: 8 }}>Cor de fundo</SectionLabel>
                <input type="color" value={theme.bgColor} onChange={(e) => setTk({ bgColor: e.target.value })} style={{ width: 48, height: 40, border: "none", background: "none" }} />
              </div>
              {(["avatarUrl", "logoUrl", "bgImageUrl"] as const).map((campo) => (
                <div key={campo}>
                  <SectionLabel style={{ marginBottom: 8 }}>
                    {campo === "avatarUrl" ? "Avatar/foto" : campo === "logoUrl" ? "Logo" : "Imagem de fundo"}
                  </SectionLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {theme[campo] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={theme[campo] as string} alt="" width={44} height={44} style={{ borderRadius: 8, objectFit: "cover" }} />
                    )}
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", cursor: "pointer" }}>
                      {uploading === campo ? "Enviando…" : "Enviar imagem"}
                      <input type="file" accept="image/*" hidden onChange={(e) => upload(campo, e.target.files?.[0])} />
                    </label>
                    {theme[campo] && <button onClick={() => setTk({ [campo]: null } as Partial<FunnelTheme>)} style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600 }}>Remover</button>}
                  </div>
                </div>
              ))}
              <div>
                <SectionLabel style={{ marginBottom: 8 }}>Redes sociais (ícones no topo)</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(theme.socialLinks || []).map((l, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select
                        value={REDES.includes(l.rede) ? l.rede : "Site"}
                        onChange={(e) => setTk({ socialLinks: (theme.socialLinks || []).map((x, k) => k === i ? { ...x, rede: e.target.value } : x) })}
                        style={{ border: "1.5px solid var(--line)", borderRadius: 10, padding: "10px 8px", fontSize: 14, fontFamily: "var(--font)", color: "var(--ink)", background: "var(--card)", cursor: "pointer", flexShrink: 0 }}
                      >
                        {REDES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <Field value={l.url} onChange={(v) => setTk({ socialLinks: (theme.socialLinks || []).map((x, k) => k === i ? { ...x, url: v } : x) })} placeholder="Cole o link do seu perfil" />
                      <button onClick={() => setTk({ socialLinks: (theme.socialLinks || []).filter((_, k) => k !== i) })} style={{ color: "var(--danger)", flexShrink: 0 }}><Icon name="trash" size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => setTk({ socialLinks: [...(theme.socialLinks || []), { rede: "Instagram", url: "" }] })} style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700, textAlign: "left" }}>+ rede social</button>
                </div>
              </div>
            </div>
          ))}

          {tab === "blocos" && (!podeBlocos ? <Bloqueado nome="Construtor de blocos" /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["link", "oferta", "recurso", "whatsapp", "embed", "instagram", "recomendador", "social", "texto"] as const).map((t) => (
                  <Button key={t} size="sm" variant="outline" icon="plus" onClick={() => addBlock(t)}>{t}</Button>
                ))}
              </div>
              {blocks.length === 0 && <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Adicione blocos (links, ofertas, recursos…) que aparecem na sua página.</p>}
              {blocks.map((b, i) => (
                <Card key={b.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>{b.tipo}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => moveBlock(i, -1)} style={{ color: "var(--muted)", fontWeight: 800, fontSize: 15 }}>↑</button>
                    <button onClick={() => moveBlock(i, 1)} style={{ color: "var(--muted)", fontWeight: 800, fontSize: 15 }}>↓</button>
                    <button onClick={() => removeBlock(b.id)} style={{ color: "var(--danger)" }}><Icon name="trash" size={16} /></button>
                  </div>
                  {b.tipo === "texto" ? (
                    <Field as="textarea" value={b.texto} onChange={(v) => patchBlock(b.id, { texto: v })} />
                  ) : b.tipo === "social" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(b.links || []).map((l, li) => (
                        <div key={li} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <select
                            value={REDES.includes(l.rede) ? l.rede : "Site"}
                            onChange={(e) => patchBlock(b.id, { links: b.links.map((x, k) => k === li ? { ...x, rede: e.target.value } : x) })}
                            style={{ border: "1.5px solid var(--line)", borderRadius: 10, padding: "10px 8px", fontSize: 14, fontFamily: "var(--font)", color: "var(--ink)", background: "var(--card)", cursor: "pointer", flexShrink: 0 }}
                          >
                            {REDES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <Field value={l.url} onChange={(v) => patchBlock(b.id, { links: b.links.map((x, k) => k === li ? { ...x, url: v } : x) })} placeholder="Cole o link" />
                        </div>
                      ))}
                      <button onClick={() => patchBlock(b.id, { links: [...(b.links || []), { rede: "", url: "" }] })} style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700, textAlign: "left" }}>+ rede</button>
                    </div>
                  ) : b.tipo === "funil" || b.tipo === "recomendador" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Field value={b.titulo} onChange={(v) => patchBlock(b.id, { titulo: v })} placeholder="Título" />
                      <Field value={b.cta} onChange={(v) => patchBlock(b.id, { cta: v })} placeholder="Texto do botão" />
                      {b.tipo === "recomendador" && (
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Abre o funil por IA (em modal) que ajuda o lead a escolher.</p>
                      )}
                    </div>
                  ) : b.tipo === "whatsapp" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Field value={b.titulo} onChange={(v) => patchBlock(b.id, { titulo: v })} placeholder="Título (ex.: Publicidade)" />
                      <Field value={b.numero} onChange={(v) => patchBlock(b.id, { numero: v } as Partial<FunnelBlock>)} placeholder="Número com DDD (ex.: 5511999999999)" />
                      <Field value={b.descricao || ""} onChange={(v) => patchBlock(b.id, { descricao: v })} placeholder="Descrição (opcional)" />
                      <Field value={b.cta || ""} onChange={(v) => patchBlock(b.id, { cta: v })} placeholder="Texto do botão (opcional)" />
                    </div>
                  ) : b.tipo === "embed" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {(["youtube", "spotify", "generico"] as const).map((p) => (
                          <button key={p} onClick={() => patchBlock(b.id, { provedor: p } as Partial<FunnelBlock>)}
                            style={{ flex: 1, padding: "7px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
                              border: `1.5px solid ${b.provedor === p ? "var(--accent)" : "var(--line)"}`,
                              background: b.provedor === p ? "var(--accent-050)" : "var(--card)", color: b.provedor === p ? "var(--accent-800)" : "var(--muted)" }}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <Field value={b.url} onChange={(v) => patchBlock(b.id, { url: v })} placeholder="Cole o link (YouTube/Spotify/URL)" />
                      <Field value={b.titulo || ""} onChange={(v) => patchBlock(b.id, { titulo: v })} placeholder="Título (opcional)" />
                    </div>
                  ) : b.tipo === "instagram" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Field value={b.titulo || ""} onChange={(v) => patchBlock(b.id, { titulo: v })} placeholder="Título (ex.: No meu Instagram)" />
                      <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Mostra seus posts recentes do Instagram conectado. Some se a conta não estiver conectada.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Field value={b.titulo} onChange={(v) => patchBlock(b.id, { titulo: v })} placeholder="Título" />
                      <Field value={b.url} onChange={(v) => patchBlock(b.id, { url: v })} placeholder="URL" />
                      {(b.tipo === "oferta" || b.tipo === "recurso") && (
                        <Field value={b.descricao || ""} onChange={(v) => patchBlock(b.id, { descricao: v })} placeholder="Descrição" />
                      )}
                      {b.tipo === "oferta" && (
                        <Field value={b.preco || ""} onChange={(v) => patchBlock(b.id, { preco: v })} placeholder="Preço (ex.: R$97)" />
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {b.imagemUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.imagemUrl} alt="" width={40} height={40} style={{ borderRadius: 8, objectFit: "cover" }} />
                        )}
                        <label style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", cursor: "pointer" }}>
                          {uploading === "bloco-" + b.id ? "Enviando…" : b.imagemUrl ? "Trocar imagem" : "Enviar imagem"}
                          <input type="file" accept="image/*" hidden onChange={(e) => uploadBlockImage(b.id, e.target.files?.[0])} />
                        </label>
                        {b.imagemUrl && <button onClick={() => patchBlock(b.id, { imagemUrl: undefined } as Partial<FunnelBlock>)} style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600 }}>Remover</button>}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ))}

          {tab === "funil" && (
            <div>
              <SectionLabel style={{ marginBottom: 4 }}>Tipo de funil</SectionLabel>
              <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>
                Define o comportamento do fluxo. Aplica perguntas e mensagem iniciais — você ajusta tudo abaixo.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 18 }}>
                {FLOW_PRESETS.map((p) => (
                  <button key={p.key} onClick={() => { setFlowPreset(p.key); updateFunnel({ perguntas: presetQuestions(p.key), mensagemBoasVindas: p.boasVindas, objetivo: p.objetivo }); toast("Preset aplicado — ajuste o conteúdo abaixo"); }}
                    style={{ textAlign: "left", padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${flowPreset === p.key ? "var(--accent)" : "var(--line)"}`,
                      background: flowPreset === p.key ? "var(--accent-050)" : "var(--card)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: flowPreset === p.key ? "var(--accent-800)" : "var(--ink)" }}>{p.label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{p.descricao}</div>
                  </button>
                ))}
              </div>
              <FunilEditor />
            </div>
          )}

          {tab === "recursos" && <RecursosDoFunil />}

          {tab === "previa" && (
            <div style={{ border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", maxHeight: 640 }} className="lg:hidden">
              <PreviewPane funnel={previewFunnel} />
            </div>
          )}
        </div>

        {/* Prévia fixa no desktop */}
        <div className="hidden lg:block lg:sticky lg:top-6">
          <div style={{ border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", height: 700 }}>
            <PreviewPane funnel={previewFunnel} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPane({ funnel }: { funnel: import("@/lib/types").Funnel }) {
  const professional = useStore((s) => s.professional);
  const disponibilidade = useStore((s) => s.disponibilidade);
  // A prévia segue o modo do funil (gated por chat_ia), igual ao render público.
  const aiChat = funnel.pageMode === "conversa" && hasFeature(professional, "chat_ia");
  return (
    <div style={{ height: "100%", overflowY: "auto" }} className="no-sb">
      {aiChat ? (
        <AiFunnelChat funnel={funnel} professional={professional} disponibilidade={disponibilidade} preview />
      ) : (
        <LadoB funnelOverride={funnel} professionalOverride={professional} disponibilidadeOverride={disponibilidade} />
      )}
    </div>
  );
}

function RecursosDoFunil() {
  const professional = useStore((s) => s.professional);
  const funnel = useStore((s) => s.funnel);
  const updateFunnel = useStore((s) => s.updateFunnel);
  const toast = useStore((s) => s.toast);

  const catalogo = (professional.produtos || []).filter((r) => r.ativo !== false);
  const idsSelecionados = React.useMemo(
    () => new Set((funnel.produtos || []).map((r) => r.id).filter(Boolean) as string[]),
    [funnel.produtos],
  );
  const [selecionados, setSelecionados] = React.useState<Set<string>>(idsSelecionados);

  React.useEffect(() => {
    setSelecionados(idsSelecionados);
  }, [idsSelecionados]);

  const toggle = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const produtos = catalogo.filter((r) => r.id && next.has(r.id));
      updateFunnel({ produtos });
      return next;
    });
    toast("Recursos do funil atualizados ✓");
  };

  const tipoLabel = (t?: string) =>
    t === "agenda" ? "Agenda" : t === "pdf" ? "PDF" : t === "whatsapp" ? "WhatsApp" : "Link";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, flex: 1 }}>
          Escolha quais recursos do seu catálogo este funil exibe.
        </p>
        <a href="/recursos" style={{ textDecoration: "none" }}>
          <Button size="sm" variant="outline" icon="settings">Gerenciar recursos</Button>
        </a>
      </div>

      {catalogo.length === 0 ? (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 12px", textAlign: "center" }}>
            <Icon name="tag" size={22} />
            <div style={{ fontWeight: 700 }}>Nenhum recurso no catálogo ainda</div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Crie recursos (link, agenda, PDF, WhatsApp) para escolher aqui.</p>
            <a href="/recursos" style={{ textDecoration: "none" }}><Button size="sm">Criar recursos</Button></a>
          </div>
        </Card>
      ) : (
        catalogo.map((r) => {
          const on = !!r.id && selecionados.has(r.id);
          return (
            <Card key={r.id ?? r.nome}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                {r.emoji && <span style={{ fontSize: 22 }}>{r.emoji}</span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{r.nome}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{tipoLabel(r.tipo)}</div>
                </div>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={!r.id}
                  onChange={() => r.id && toggle(r.id)}
                  style={{ width: 20, height: 20, accentColor: "var(--accent)", cursor: "pointer" }}
                />
              </label>
            </Card>
          );
        })
      )}
    </div>
  );
}

function Bloqueado({ nome }: { nome: string }) {
  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 12px", textAlign: "center" }}>
        <Icon name="lock" size={22} />
        <div style={{ fontWeight: 700 }}>{nome} não está no seu plano</div>
        <a href="/planos" style={{ textDecoration: "none" }}><Button size="sm">Ver planos</Button></a>
      </div>
    </Card>
  );
}
