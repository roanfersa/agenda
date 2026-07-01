"use client";

import * as React from "react";
import { Button, Card, Field, SectionLabel } from "./ui";
import { Icon } from "./Icon";
import { useStore, uuid } from "@/lib/store";
import { uploadFile } from "@/lib/upload";
import { type Material, type Produto, type RecursoTipo } from "@/lib/types";

export function RecursosScreen() {
  const professional = useStore((s) => s.professional);
  const updateProfessional = useStore((s) => s.updateProfessional);
  const toast = useStore((s) => s.toast);

  // Biblioteca de contexto: nível do profissional (reusada por todos os links).
  const [produtos, setProdutos] = React.useState<Produto[]>(professional.produtos || []);
  const [materiais, setMateriais] = React.useState<Material[]>(professional.materiais || []);
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [analisando, setAnalisando] = React.useState<string | null>(null);

  const salvarBiblioteca = () => updateProfessional({ produtos, materiais });

  // Lê/extrai o conteúdo de um material (PDF/DOCX/HTML/imagem) e cacheia.
  const extrair = async (m: Material) => {
    if (!m.url) return;
    setAnalisando(m.id);
    setMateriais((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: "pendente" } : x)));
    try {
      const res = await fetch("/api/materials/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: m.tipo, url: m.url, titulo: m.titulo, descricao: m.descricao }),
      });
      const data = await res.json();
      if (res.ok && data.conteudo) {
        setMateriais((ms) => ms.map((x) => (x.id === m.id ? { ...x, conteudo: data.conteudo, status: "pronto" } : x)));
        toast("Conteúdo lido ✓");
      } else {
        setMateriais((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: "erro" } : x)));
        toast(data.error || "Não consegui ler o material.");
      }
    } catch {
      setMateriais((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: "erro" } : x)));
      toast("Erro de conexão ao ler o material.");
    } finally {
      setAnalisando(null);
    }
  };

  // Lê o conteúdo de um PDF de recurso (mesma rota da biblioteca).
  const extrairRecurso = async (id: string, url: string, titulo: string) => {
    setAnalisando(id);
    setProdutos((ps) => ps.map((x) => (x.id === id ? { ...x, status: "pendente" } : x)));
    try {
      const res = await fetch("/api/materials/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "arquivo", url, titulo, descricao: "" }),
      });
      const data = await res.json();
      if (res.ok && data.conteudo) {
        setProdutos((ps) => ps.map((x) => (x.id === id ? { ...x, conteudo: data.conteudo, status: "pronto" } : x)));
        toast("PDF lido ✓");
      } else {
        setProdutos((ps) => ps.map((x) => (x.id === id ? { ...x, status: "erro" } : x)));
      }
    } catch {
      setProdutos((ps) => ps.map((x) => (x.id === id ? { ...x, status: "erro" } : x)));
    } finally {
      setAnalisando(null);
    }
  };

  return (
    <div style={{ padding: "0 16px" }} className="lg:px-0 lg:max-w-3xl">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--accent-050)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, color: "var(--accent-800)", fontWeight: 600 }}>
          📚 Esta biblioteca é da sua conta — fica salva e é reutilizada em todos os seus links e pela IA.
        </div>
        <SectionLabel>Recursos</SectionLabel>
        <p style={{ fontSize: 12.5, color: "var(--muted)" }}>As formas de acesso que você oferece: link, agendamento, PDF ou WhatsApp. Viram botões na sua bio e a IA recomenda o mais adequado.</p>
        {produtos.map((p, i) => {
          const tipo = (p.tipo ?? "link") as RecursoTipo;
          const setP = (patch: Partial<Produto>) => setProdutos((ps) => ps.map((x, k) => (k === i ? { ...x, ...patch } : x)));
          return (
            <Card key={p.id ?? i}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <select
                  value={tipo}
                  onChange={(e) => setP({ tipo: e.target.value as RecursoTipo })}
                  style={{ fontSize: 12.5, fontWeight: 700, border: "1px solid var(--line)", borderRadius: 8, padding: "5px 8px", color: "var(--ink)", background: "#fff" }}
                >
                  <option value="link">Link</option>
                  <option value="agenda">Agendamento</option>
                  <option value="pdf">PDF</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <div style={{ flex: 1 }} />
                <label style={{ fontSize: 12, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <input type="checkbox" checked={p.ativo !== false} onChange={(e) => setP({ ativo: e.target.checked })} /> ativo
                </label>
                <button onClick={() => setProdutos((ps) => ps.filter((_, k) => k !== i))} style={{ color: "var(--danger)" }}><Icon name="trash" size={16} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 64 }}><Field value={p.emoji || ""} onChange={(v) => setP({ emoji: v })} placeholder="🔗" /></div>
                  <Field value={p.nome} onChange={(v) => setP({ nome: v })} placeholder="Nome do recurso" />
                </div>
                <Field as="textarea" value={p.descricao} onChange={(v) => setP({ descricao: v })} placeholder="Descrição (a IA usa pra recomendar)" />
                {tipo === "link" && <Field value={p.link || ""} onChange={(v) => setP({ link: v })} placeholder="URL do link" />}
                {tipo === "pdf" && (
                  p.link ? (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <a href={p.link} target="_blank" rel="noopener" style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700 }}>Ver PDF</a>
                      <span style={{ fontSize: 12, color: p.status === "pronto" ? "var(--accent)" : p.status === "erro" ? "var(--danger)" : "var(--muted)" }}>
                        {analisando === p.id ? "Lendo…" : p.status === "pronto" ? "Conteúdo lido ✓" : p.status === "erro" ? "Falha na leitura" : ""}
                      </span>
                      <button onClick={() => setP({ link: "" })} style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>trocar</button>
                    </div>
                  ) : (
                    <label style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>
                      {uploading === p.id ? "Enviando…" : "Enviar PDF"}
                      <input type="file" hidden accept=".pdf" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const rid = p.id ?? uuid();
                        setUploading(rid);
                        try {
                          const url = await uploadFile("contexto", professional.id, file);
                          setProdutos((ps) => ps.map((x, k) => (k === i ? { ...x, id: rid, link: url, nome: x.nome || file.name } : x)));
                          setUploading(null);
                          extrairRecurso(rid, url, p.nome || file.name);
                        } catch { toast("Falha no upload"); setUploading(null); }
                      }} />
                    </label>
                  )
                )}
                {tipo === "agenda" && <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Usa sua agenda configurada (disponibilidade / Calendly / Google) no fluxo do funil.</p>}
                {tipo === "whatsapp" && <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Leva a conversa pro seu WhatsApp ({professional.whatsapp || "configure em Ajustes"}).</p>}
                {(tipo === "link" || tipo === "pdf") && <Field value={p.preco || ""} onChange={(v) => setP({ preco: v })} placeholder="Preço (opcional)" />}
              </div>
            </Card>
          );
        })}
        <Button size="sm" variant="outline" icon="plus" onClick={() => setProdutos((ps) => [...ps, { id: uuid(), tipo: "link", nome: "", descricao: "", ativo: true }])}>Adicionar recurso</Button>

        <SectionLabel style={{ marginTop: 10 }}>Materiais de referência</SectionLabel>
        <p style={{ fontSize: 12.5, color: "var(--muted)" }}>Arquivos (PDF, tabela de preços…), notas ou links que descrevem seu contexto. A IA usa pra entender seu trabalho.</p>
        {materiais.map((m) => (
          <Card key={m.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", color: "var(--muted)" }}>{m.tipo}</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setMateriais((ms) => ms.filter((x) => x.id !== m.id))} style={{ color: "var(--danger)" }}><Icon name="trash" size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Field value={m.titulo} onChange={(v) => setMateriais((ms) => ms.map((x) => x.id === m.id ? { ...x, titulo: v } : x))} placeholder="Título" />
              <Field as="textarea" value={m.descricao} onChange={(v) => setMateriais((ms) => ms.map((x) => x.id === m.id ? { ...x, descricao: v } : x))} placeholder="Descrição / contexto pra IA" />
              {m.tipo === "link" && (
                <Field value={m.url || ""} onChange={(v) => setMateriais((ms) => ms.map((x) => x.id === m.id ? { ...x, url: v } : x))} placeholder="URL" />
              )}
              {m.tipo === "arquivo" && (
                m.url ? (
                  <a href={m.url} target="_blank" rel="noopener" style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700 }}>Ver arquivo enviado</a>
                ) : (
                  <label style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>
                    {uploading === m.id ? "Enviando…" : "Enviar arquivo"}
                    <input type="file" hidden accept=".pdf,.doc,.docx,.txt,image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(m.id);
                      try {
                        const url = await uploadFile("contexto", professional.id, file);
                        const merged = { ...m, url, titulo: m.titulo || file.name };
                        setMateriais((ms) => ms.map((x) => x.id === m.id ? merged : x));
                        setUploading(null);
                        extrair(merged); // lê o conteúdo automaticamente
                      } catch { toast("Falha no upload"); setUploading(null); }
                    }} />
                  </label>
                )
              )}
              {/* Status da leitura + ações */}
              {(m.url || m.conteudo) && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.status === "erro" ? "var(--danger)" : m.status === "pronto" ? "var(--accent)" : "var(--muted)" }}>
                    {analisando === m.id || m.status === "pendente" ? "Lendo conteúdo…" : m.status === "pronto" ? "Conteúdo lido ✓" : m.status === "erro" ? "Falha na leitura" : "Não lido"}
                  </span>
                  {m.url && (
                    <button onClick={() => extrair(m)} disabled={analisando === m.id} style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700 }}>
                      {m.tipo === "link" ? "Ler página" : "Reanalisar"}
                    </button>
                  )}
                </div>
              )}
              {m.conteudo && (
                <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--bg)", borderRadius: 8, padding: "8px 10px", maxHeight: 96, overflow: "auto", lineHeight: 1.4 }}>
                  {m.conteudo.slice(0, 400)}{m.conteudo.length > 400 ? "…" : ""}
                </div>
              )}
            </div>
          </Card>
        ))}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["arquivo", "texto", "link"] as const).map((t) => (
            <Button key={t} size="sm" variant="outline" icon="plus" onClick={() => setMateriais((ms) => [...ms, { id: uuid(), tipo: t, titulo: "", descricao: "" }])}>{t}</Button>
          ))}
        </div>
        <Button size="sm" onClick={() => { salvarBiblioteca(); toast("Recursos salvos ✓"); }}>Salvar</Button>
      </div>
    </div>
  );
}
