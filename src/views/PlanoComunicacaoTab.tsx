/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { C } from "../lib/constants";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// Páginas de franqueada já publicadas em /public/plano/<slug>/
const PAGINAS = ["sinop", "blumenau"];

const ST: Record<string, { label: string; color: string; bg: string }> = {
  inicio: { label: "Início", color: C.textMuted, bg: C.inset },
  andamento: { label: "Em andamento", color: C.amareloTxt, bg: "#fdf6dc" },
  feito: { label: "Feito", color: C.verde, bg: "#e8f5ee" },
  nao: { label: "Não concluído", color: C.red, bg: C.redBg },
};

const IND = [["reels","Reels publicados"],["seguidores","Seguidores"],["pedidos","Pedidos"],["avaliacoes","Avaliações Google"],["conversas","Conversas WhatsApp"]];

function slugDe(nome: string) {
  const parte = String(nome || "").split("-").pop() || "";
  return parte.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function novoToken() {
  const a = new Uint8Array(18); crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
}
function quando(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function Chip({ s }: { s: string }) {
  const c = ST[s] || ST.inicio;
  return <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" }}>{c.label}</span>;
}
function Bloco({ titulo, children, extra }: { titulo: string; children: any; extra?: any }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ ...labelSt, marginBottom: 0 }}>{titulo}</span>{extra}
      </div>
      {children}
    </div>
  );
}
function Linha({ it }: { it: any }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", borderBottom: `1px solid ${C.insetBorder}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{it.nome}</div>
        {it.obs ? <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>obs: {it.obs}</div> : null}
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{it.dia > 0 ? `dia ${String(it.dia).padStart(2, "0")}/11 · ` : it.dia === 0 ? "preparação · " : ""}atualizado {quando(it.updated_at)}</div>
      </div>
      <Chip s={it.status} />
    </div>
  );
}

export function PlanoComunicacaoTab({ unit }: { unit: any }) {
  const [plano, setPlano] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ slug: slugDe(unit.name), franqueada: unit.franchiseeName || unit.responsavelOp || "" });
  const [copiado, setCopiado] = useState(false);

  function buscar() {
    return Promise.all([
      sb.get("plano_unidade", `?unit_id=eq.${encodeURIComponent(unit.id)}&select=*`),
      sb.get("plano_execucao", `?unit_id=eq.${encodeURIComponent(unit.id)}&select=*&order=updated_at.desc`),
    ]);
  }
  function aplicar([p, e]: any[]) { setPlano(p && p[0] ? p[0] : null); setItens(e || []); }
  const ERRO_LER = "Não consegui ler o plano. Confira se a migração plano_comunicacao foi rodada no Supabase.";
  function carregar() {
    setCarregando(true); setErro("");
    buscar().then(aplicar).catch(() => setErro(ERRO_LER)).finally(() => setCarregando(false));
  }
  useEffect(() => {
    let vivo = true;
    buscar().then(r => { if (vivo) aplicar(r); }).catch(() => { if (vivo) setErro(ERRO_LER); }).finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit.id]);

  async function ativar() {
    if (!form.slug) { setErro("Preencha o nome da página."); return; }
    try {
      const novo = { unit_id: String(unit.id), unit_name: unit.name, slug: form.slug, token: novoToken(), franqueada: form.franqueada, ativo: true };
      const r = await sb.post("plano_unidade", novo);
      setPlano(r && r[0] ? r[0] : novo);
    } catch (err) { setErro("Não consegui ativar: " + (err as Error).message); }
  }

  const link = plano ? `${window.location.origin}/plano/${plano.slug}/?k=${plano.token}` : "";
  const msgWa = plano ? `Oi, ${plano.franqueada || ""}! Aqui está o seu plano de comunicação do clubkids com as tarefas de cada dia. Salve este link e abra sempre por ele: ${link}` : "";
  const fone = String(unit.whatsapp || unit.telefoneAtendimento || "").replace(/\D/g, "");

  const v = useMemo(() => {
    const reais = itens.filter(i => !i.item_id.startsWith("_"));
    const dias = itens.filter(i => i.item_id.startsWith("_dia:")).map(i => {
      const [f, t] = String(i.valor || "0/0").split("/").map(Number);
      return { dia: i.dia, f, t };
    }).sort((a, b) => a.dia - b.dia);
    const hoje = new Date();
    const diaHoje = hoje.getFullYear() === 2026 && hoje.getMonth() === 10 ? hoje.getDate() : hoje > new Date(2026, 10, 30) ? 30 : 0;
    const ate = diaHoje === 0 ? dias.filter(d => d.dia === 0) : dias.filter(d => d.dia >= 1 && d.dia <= diaHoje);
    const f = ate.reduce((s, d) => s + d.f, 0), t = ate.reduce((s, d) => s + d.t, 0);
    const ind: Record<string, Record<string, string>> = {};
    itens.filter(i => i.item_id.startsWith("_ind:")).forEach(i => { const [, s, k] = i.item_id.split(":"); ind[s] = { ...(ind[s] || {}), [k]: i.valor }; });
    const posts: Record<string, any> = {};
    reais.filter(i => /^p\d+-(gravado|agendado|publicado)$/.test(i.item_id)).forEach(i => { const [pid, etapa] = i.item_id.split("-"); posts[pid] = { ...(posts[pid] || {}), [etapa]: i }; });
    return {
      ultimo: itens[0]?.updated_at || null,
      pct: t ? Math.round(f / t * 100) : 0, f, t, diaHoje,
      ultimos7: dias.filter(d => d.dia >= Math.max(1, diaHoje - 6) && d.dia <= diaHoje),
      nao: reais.filter(i => i.status === "nao"),
      andamento: reais.filter(i => i.status === "andamento"),
      reuniao: reais.filter(i => i.item_id.startsWith("plano-reuniao-") || i.item_id.startsWith("plano-trafego-")),
      checklists: reais.filter(i => i.item_id.startsWith("plano-") && !i.item_id.startsWith("plano-reuniao-") && !i.item_id.startsWith("plano-trafego-")),
      acoes: reais.filter(i => /^\d+-a\d$/.test(i.item_id) && i.escolha),
      posts: Object.entries(posts),
      ind,
    };
  }, [itens]);

  if (carregando) return <div style={{ fontSize: 12, color: C.textMuted }}>Carregando plano de comunicação…</div>;

  if (!plano) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {erro && <div style={{ fontSize: 12, color: C.red }}>{erro}</div>}
        <Bloco titulo="Ativar plano de comunicação">
          <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 10px" }}>Gera o link da franqueada. O que ela marcar na página aparece aqui.</p>
          <label style={labelSt}>Nome da página (pasta em /plano/)</label>
          <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} style={{ ...(inputSt as any), marginBottom: 8 }} />
          {!PAGINAS.includes(form.slug) && <div style={{ fontSize: 11, color: C.amareloTxt, marginBottom: 8 }}>A página desta unidade ainda não foi criada. Hoje existe: {PAGINAS.join(", ")}.</div>}
          <label style={labelSt}>Franqueada</label>
          <input value={form.franqueada} onChange={e => setForm({ ...form, franqueada: e.target.value })} style={{ ...(inputSt as any), marginBottom: 10 }} />
          <button onClick={ativar} style={btnSt(C.laranja)}>Ativar e gerar link</button>
        </Bloco>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {erro && <div style={{ fontSize: 12, color: C.red }}>{erro}</div>}

      <Bloco titulo="Materiais de apoio"><p style={{fontSize:12,color:C.textMuted}}>O plano inclui fotos e vídeos por brinquedo, provas sociais, feedbacks, campanhas e o guia de parcerias locais.</p><a href="https://drive.google.com/drive/folders/1nHtVbkHbTmazMI369MmNS_gZu15m8kFh" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.textPrimary}}>Abrir a pasta do franqueado ↗</a></Bloco>
      <Bloco titulo="Retornos semanais"><p style={{fontSize:12,color:C.textMuted}}>Fechamento na virada de sexta para sábado, às 00h de Brasília. A checagem e o envio automático no WhatsApp ainda dependem de integração.</p>{itens.filter(i=>i.item_id.startsWith("_weekly:")).map(i=>{let r:any;try{r=JSON.parse(i.valor||"{}");}catch{return null;}return <p key={i.item_id} style={{fontSize:12}}>Semana {i.item_id.slice(8)}: envio declarado em {quando(r.sentAt)} por {r.confirmedBy}. Registro manual; não confirma entrega no WhatsApp.</p>;})}</Bloco>
      <Bloco titulo="Link da franqueada" extra={<button onClick={carregar} style={{ ...btnSt(C.inset, C.textPrimary), border: `1px solid ${C.cardBorder}`, padding: "4px 10px", fontSize: 11 }}>Atualizar</button>}>
        <div style={{ fontSize: 11, wordBreak: "break-all", background: C.inset, padding: 8, borderRadius: 8, marginBottom: 8 }}>{link}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => { navigator.clipboard?.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 1500); }} style={btnSt(C.laranja)}>{copiado ? "Copiado ✓" : "Copiar link"}</button>
          <a href={`https://wa.me/${fone ? "55" + fone.replace(/^55/, "") : ""}?text=${encodeURIComponent(msgWa)}`} target="_blank" rel="noopener" style={{ ...btnSt("#25D36622", "#25D366"), border: "1px solid #25D36644", textDecoration: "none" }}>Enviar no WhatsApp</a>
          <a href={link} target="_blank" rel="noopener" style={{ ...btnSt(C.inset, C.textPrimary), border: `1px solid ${C.cardBorder}`, textDecoration: "none" }}>Abrir página</a>
        </div>
        {!PAGINAS.includes(plano.slug) && <div style={{ fontSize: 11, color: C.amareloTxt, marginTop: 8 }}>A página /plano/{plano.slug}/ ainda não existe no site.</div>}
      </Bloco>

      <Bloco titulo={`Execução de novembro${v.ultimo ? ` · última atualização ${quando(v.ultimo)}` : " · ainda sem registros"}`}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: v.pct >= 70 ? C.verde : v.pct >= 40 ? C.amareloTxt : C.red }}>{v.pct}%</span>
          <span style={{ fontSize: 12, color: C.textMuted }}>{v.f} de {v.t} {v.diaHoje === 0 ? "tarefas da preparação feitas (o plano começa em 01/11)" : "tarefas feitas até hoje"}</span>
        </div>
        {v.ultimos7.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
            {v.ultimos7.map(d => {
              const p = d.t ? d.f / d.t : 0;
              return <div key={d.dia} title={`${d.f}/${d.t}`} style={{ textAlign: "center", fontSize: 10, padding: "4px 6px", borderRadius: 6, minWidth: 40, background: p === 1 ? "#e8f5ee" : p > 0 ? "#fdf6dc" : C.redBg, color: C.textPrimary }}>
                <b>{String(d.dia).padStart(2, "0")}/11</b><br />{d.f}/{d.t}</div>;
            })}
          </div>
        )}
      </Bloco>

      <Bloco titulo={`Não concluído (${v.nao.length})`}>
        {v.nao.length ? v.nao.map(i => <Linha key={i.item_id} it={i} />) : <div style={{ fontSize: 12, color: C.textMuted }}>Nada marcado como não concluído.</div>}
      </Bloco>

      <Bloco titulo={`Em andamento (${v.andamento.length})`}>
        {v.andamento.length ? v.andamento.map(i => <Linha key={i.item_id} it={i} />) : <div style={{ fontSize: 12, color: C.textMuted }}>Nada em andamento.</div>}
      </Bloco>

      <Bloco titulo="Combinados da reunião de gestão">
        {v.reuniao.length ? v.reuniao.map(i => <Linha key={i.item_id} it={i} />) : <div style={{ fontSize: 12, color: C.textMuted }}>A franqueada ainda não atualizou os combinados.</div>}
      </Bloco>

      <Bloco titulo="Posts do cronograma">
        {v.posts.length ? v.posts.map(([pid, e]) => {
          const ref = e.publicado || e.agendado || e.gravado;
          return <div key={pid} style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${C.insetBorder}`, flexWrap: "wrap" }}>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, minWidth: 140 }}>{(ref?.nome || pid).replace(/^(Gravar|Agendar|Conferir se saiu e compartilhar:?)\s*/i, "")}</span>
            {["gravado", "agendado", "publicado"].map(k => <span key={k} style={{ fontSize: 10, color: C.textMuted }}>{k}: <Chip s={e[k]?.status || "inicio"} /></span>)}
          </div>;
        }) : <div style={{ fontSize: 12, color: C.textMuted }}>Nenhum post marcado ainda.</div>}
      </Bloco>

      <Bloco titulo="Ações do dia escolhidas">
        {v.acoes.length ? v.acoes.map(i => <Linha key={i.item_id} it={i} />) : <div style={{ fontSize: 12, color: C.textMuted }}>Nenhuma ação escolhida ainda.</div>}
      </Bloco>

      <Bloco titulo="Indicadores da semana (preenchidos pela franqueada)">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr><th style={{ textAlign: "left", color: C.textMuted, fontWeight: 600 }}></th>{[1, 2, 3, 4].map(s => <th key={s} style={{ color: C.textMuted, fontWeight: 600 }}>sem {s}</th>)}</tr></thead>
          <tbody>{IND.map(([k, n]) => <tr key={k}><td style={{ padding: "4px 0" }}>{n}</td>{[1, 2, 3, 4].map(s => <td key={s} style={{ textAlign: "center" }}>{v.ind[s]?.[k] || "—"}</td>)}</tr>)}</tbody>
        </table>
      </Bloco>

      <Bloco titulo="Checklists do plano (Google, WhatsApp, parcerias)">
        {v.checklists.length ? v.checklists.map(i => <Linha key={i.item_id} it={i} />) : <div style={{ fontSize: 12, color: C.textMuted }}>Nenhum item atualizado ainda.</div>}
      </Bloco>
    </div>
  );
}

