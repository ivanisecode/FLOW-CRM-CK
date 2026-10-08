import { useState, useEffect } from "react";
import { ProgressBar } from "../components/shared";
import { C, TODAY } from "../lib/constants";
import { fmtDate } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// ─── ETAPA 1 CHECKLIST ───────────────────────────────────────
const ETAPA1_ITEMS = [
  // DIVERSOS
  { id:"e1_01", grupo:"Diversos", titulo:"Criar e-mail da unidade no Gmail", desc:"Padrão: ig@gmail.com (ex.: clubkidsjoaopessoa@gmail.com)", resp:"Franqueado" },
  { id:"e1_02", grupo:"Diversos", titulo:"Abrir MEI", desc:"CNAE 7721-7/00 + CNAE 4763-6/01. Atenção: não pagar boleto por e-mail após abertura.", resp:"Franqueado" },
  { id:"e1_03", grupo:"Diversos", titulo:"Solicitar Inscrição Estadual", desc:"CNAE 4763-6/01. Após receber, preencher planilha DADOS DA UNIDADE e enviar para a franqueadora.", resp:"Franqueado" },
  { id:"e1_04", grupo:"Diversos", titulo:"Compra imediata de chip de celular", desc:"Para personalização prévia de cartão de visita e panfleto.", resp:"Franqueado" },
  { id:"e1_05", grupo:"Diversos", titulo:"Celular para uso exclusivo do o clubkids", desc:"iPhone a partir do 11 ou Samsung a partir do S11. Se já possui, comprar chip virtual.", resp:"Franqueado" },
  { id:"e1_06", grupo:"Diversos", titulo:"Pesquisar parcerias e enviar links para validação", desc:"Influencers gestantes/filhos 0-4a, fotógrafo newborn, pediatras, doulas, maternidades, nutricionistas, escolas, buffets infantis, etc.", resp:"Franqueado", apoio:"Ivanise" },
  { id:"e1_07", grupo:"Diversos", titulo:"Explorar APENAS a pasta 1 ETAPA – Inauguração no Google Drive", desc:"Não acessar outras pastas ainda.", resp:"Franqueado" },
  { id:"e1_08", grupo:"Diversos", titulo:"Confecção de camisas padronizadas (serigrafia)", desc:"3 modelos disponíveis na pasta Drive: polo bordado, polo DTF, dryfit sublimação.", resp:"Franqueado" },
  { id:"e1_09", grupo:"Diversos", titulo:"Material gráfico — ATUALCARD + gráfica local", desc:"TAG 1ª locação (500), panfletos (2.500), cartão de visita (1.000 com verniz 30%), adesivo higienizado (500), adesivo carro (opc.), FlyBanner (opc.), livrinho pintura (opc.).", resp:"Franqueado" },
  { id:"e1_10", grupo:"Diversos", titulo:"Comprar material para embalagem dos brinquedos", desc:"Sacos plásticos (gramatura 12, cristal, 200 un, 0,80x1,10m e 0,80x0,60m), rolo filme PVC (2 un), rolo saco pequeno, durex largo, enforca gato 20cm.", resp:"Franqueado" },
  { id:"e1_11", grupo:"Diversos", titulo:"Comprar material para higienização", desc:"Sabão neutro, detergente neutro, álcool 70% (galão 5L), vaselina Doppler, buchas, pano perfex, chave de fenda, Vanish, limpa contato, gracha branca, silicone líquido.", resp:"Franqueado" },
  { id:"e1_12", grupo:"Diversos", titulo:"Compra de Bags para peças avulsas/carregadores (opcional)", desc:"Pastinha P 15x17, bolsinha c/ proteção 17x21x15, maletas transparentes P/M/G.", resp:"Franqueado", opcional:true },
  { id:"e1_13", grupo:"Diversos", titulo:"Compra de Etiquetadora", desc:"Para identificar controles de elétricos e fontes. Deve conter: PRODUTO – VOLTAGEM – AMPERAGEM.", resp:"Franqueado" },
  { id:"e1_14", grupo:"Diversos", titulo:"Compra de brinquedos (1ªs compras à vista/PIX no representante)", desc:"Franqueadora faz o 1º pedido. Franqueado paga direto ao fornecedor. Conferir endereço nos romaneios. Etiquetar carregadores.", resp:"Mariana", apoio:"Franqueado" },
  { id:"e1_15", grupo:"Diversos", titulo:"Preenchimento e envio da planilha de estoque no grupo WPP", desc:"Salvar planilha do Drive, preencher e enviar sempre que houver compra ou chegada. Colorir itens que chegarem para planejar entrega aos parceiros.", resp:"Franqueado" },
  { id:"e1_16", grupo:"Diversos", titulo:"Aulas na universidade corporativa", desc:"a) Processo para abertura de Franquia (30min) · b) Sistema de gerenciamento — Módulo 1 (2min) + Módulo 2 (7min).", resp:"Franqueado" },
  { id:"e1_17", grupo:"Diversos", titulo:"Cadastramento de brinquedos no sistema", desc:"Categorias 0-11 em sequência. Planos por tipo de produto (Doppler 30/60/90d, carros 7/15/30d, etc.).", resp:"Franqueado", apoio:"Jeniffer" },
  { id:"e1_18", grupo:"Diversos", titulo:"Colocar brinquedos em destaques no sistema", desc:"", resp:"Franqueado" },
  // INSTAGRAM
  { id:"e1_19", grupo:"Instagram", titulo:"Alterar senha do Instagram + autenticação de dois fatores", desc:"", resp:"Franqueado", apoio:"Jeniffer" },
  { id:"e1_20", grupo:"Instagram", titulo:"Publicar os 21 posts padronizados do feed (Trello)", desc:"Apenas salvar jpg, copiar legenda, editar telefone. NÃO alterar legendas. Reels podem ser feitos mas ocultados do feed até inauguração.", resp:"Franqueado" },
  { id:"e1_21", grupo:"Instagram", titulo:"Stories e Reels livres de qualidade", desc:"Apresentação, como funciona, sustentabilidade, enquetes, spoilers caixas, higienização, unboxing, entrega. Marcar @clubkidsoficial e @franquiasclubkids discretamente.", resp:"Franqueado" },
  { id:"e1_22", grupo:"Instagram", titulo:"Prospecção de clientes no Instagram", desc:"Seguir perfis de parceiros e público infantil (mulheres jovens com filhos). Máximo 20 por hora.", resp:"Franqueado" },
  { id:"e1_23", grupo:"Instagram", titulo:"Pedir ajuda a amigas mães para divulgar o Instagram", desc:"", resp:"Franqueado" },
  { id:"e1_24", grupo:"Instagram", titulo:"Navegar pelo Instagram de outras unidades como referência de conteúdo", desc:"", resp:"Franqueado" },
];

const ETAPAS_GESTACAO = [
  { id:"e1", numero:1, nome:"Etapa 1 — Diversos + Instagram", cor:"#f19134", items: ETAPA1_ITEMS.length, resp:"Franqueado + Jeniffer + Mariana" },
  { id:"e2", numero:2, nome:"Etapa 2 — Parcerias e chegada dos brinquedos", cor:"#6e81bf", items: 0, resp:"Franqueado + Ivanise", pendente:true },
  { id:"e3", numero:3, nome:"Etapa 3 — Estratégia de lançamento", cor:"#6ece87", items: 0, resp:"Franqueado + Ivanise", pendente:true },
  { id:"e4", numero:4, nome:"Etapa 4 — Reunião pré-inauguração", cor:"#a78bfa", items: 0, resp:"Ivanise", pendente:true },
];

// Pre-inauguration meetings from Drive
const PRE_INAUG_MEETINGS = [
  { unidade:"PR - TOLEDO", data:"2026-01-13", docId:"1N4QhnLF3mN_7ByXLi2yQ6xBCYL31jpKoIKmSxPJFcsI", franqueado:"Thiago Dalmaso + Helen + Regiane (Ituiutaba) + Fernanda (Barreiras)", extra:["BA - BARREIRAS","MG - ITUIUTABA"] },
  { unidade:"AL - ARAPIRACA", data:"2026-02-09", docId:"1eYE6aRV_d2QQ0dnQP5H3ziFBwYo2G9Jfuo8_c252WT8", franqueado:"ClubKids Arapiraca", gravacao:"https://drive.google.com/file/d/1abnnotL2cE2HzqqQl87yscKLm27rw89L/view" },
  { unidade:"MG - VIÇOSA", data:"2025-06-19", docId:"1GLYXPeoOkJzjSXucGrUKuCQgRp-XFNM-yDiZMlx5t1Y", franqueado:"Milla Valhe" },
  { unidade:"SP - INDAIATUBA", data:"2025-08-07", docId:"1tEVCH_lTs4Vw5u6-aT0WBUT-JTq8S5tC-VPi31mRTc0", franqueado:"Carol Biagioni", gravacao:"https://drive.google.com/file/d/1bCqpcrRCkOu5OlFFC1T2mB6NaCBnLlm2/view" },
  { unidade:"SP - PINDAMONHANGABA", data:"2025-07-10", docId:"1EW4oYBqGFPZ8o5ZlAuVaZnIMfP9FlzGIQ8n2samgaVI", franqueado:"Cristiane Carvalho + Rafael Brugnara", extra:["SP - PAULÍNIA"] },
];


// ─── INAUGURATION MODULE ─────────────────────────────────────
export function InaugurationModule({ units, dbStatus }) {
  const [activeUnit, setActiveUnit] = useState(null);
  const [filterStatus, setFilterStatus] = useState("em_gestacao");
  const [newUnit, setNewUnit] = useState({ nome:"", dataContrato:"", dataGrupoWPP:"" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [inauguracoes, setInauguracoes] = useState(() => {
    // Pre-populate with units that are still in bercario or recently inaugurated
    const bercarios = units.filter(u => u.group === "BERÇÁRIO");
    return bercarios.map(u => ({
      id: u.name,
      nome: u.name,
      dataContrato: u.inaug,
      dataGrupoWPP: u.inaug,
      dataInauguracao: u.inaug,
      etapaAtual: "inaugurada",
      etapaChecks: {},
      preInaugMeeting: PRE_INAUG_MEETINGS.find(m => m.unidade === u.name || (m.extra||[]).includes(u.name)) || null,
      observacoes: "",
    }));
  });

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("inauguracao", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) {
        setInauguracoes(prev => {
          const dbById = {};
          rows.forEach(r => { dbById[r.id] = r; });
          const updated = prev.map(u => {
            const r = dbById[u.id];
            if (!r) return u;
            return { ...u, dataContrato: r.data_contrato||u.dataContrato, dataGrupoWPP: r.data_grupo_wpp||u.dataGrupoWPP, dataInauguracao: r.data_inauguracao||u.dataInauguracao, etapaAtual: r.etapa_atual||u.etapaAtual, etapaChecks: r.etapa_checks||u.etapaChecks, observacoes: r.observacoes||u.observacoes };
          });
          const existingIds = new Set(prev.map(u=>u.id));
          rows.forEach(r => { if(!existingIds.has(r.id)) updated.push({ id:r.id, nome:r.nome, dataContrato:r.data_contrato, dataGrupoWPP:r.data_grupo_wpp, dataInauguracao:r.data_inauguracao, etapaAtual:r.etapa_atual||"em_gestacao", etapaChecks:r.etapa_checks||{}, observacoes:r.observacoes||"" }); });
          return updated;
        });
      }
    }).catch(() => {});
  }, [dbStatus]);

  const STATUS_OPTIONS = [
    { id:"em_gestacao", label:"🐣 Em gestação", cor:"#a78bfa" },
    { id:"inaugurada", label:"✅ Inaugurada", cor:"#6ece87" },
    { id:"todas", label:"Todas", cor:"#6b7280" },
  ];

  const filtered = inauguracoes.filter(u =>
    filterStatus === "todas" || u.etapaAtual === filterStatus
  );

  function addUnit() {
    if (!newUnit.nome.trim()) return;
    const newId = `new_${Date.now()}`;
    const entry = { id: newId, nome: newUnit.nome, dataContrato: newUnit.dataContrato, dataGrupoWPP: newUnit.dataGrupoWPP, dataInauguracao: null, etapaAtual: "em_gestacao", etapaChecks: {}, preInaugMeeting: null, observacoes: "" };
    setInauguracoes(prev => [...prev, entry]);
    if (dbStatus==="ok") sb.upsert("inauguracao", { id: newId, nome: entry.nome, data_contrato: entry.dataContrato||null, data_grupo_wpp: entry.dataGrupoWPP||null, etapa_atual: "em_gestacao", etapa_checks: {} }, "id").catch(()=>{});
    setNewUnit({ nome:"", dataContrato:"", dataGrupoWPP:"" });
    setShowAddForm(false);
  }

  function updateUnit(id, updates) {
    setInauguracoes(prev => prev.map(u => u.id === id ? {...u,...updates} : u));
    if (activeUnit?.id === id) setActiveUnit(u => ({...u,...updates}));
    if (dbStatus==="ok") {
      const m={};
      if(updates.etapaAtual!==undefined) m.etapa_atual=updates.etapaAtual;
      if(updates.dataInauguracao!==undefined) m.data_inauguracao=updates.dataInauguracao||null;
      if(updates.observacoes!==undefined) m.observacoes=updates.observacoes;
      if(updates.etapaChecks!==undefined) m.etapa_checks=updates.etapaChecks;
      if(Object.keys(m).length){m.updated_at=new Date().toISOString(); sb.upsert("inauguracao",{id,...m},"id").catch(()=>{});}
    }
  }

  function toggleCheck(unitId, etapaId, itemId, val) {
    setInauguracoes(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      const ec = u.etapaChecks || {};
      const etapaChecks = ec[etapaId] || {};
      const newChecks = { ...etapaChecks, [itemId]: val };
      const newEtapaChecks = { ...ec, [etapaId]: newChecks };
      if (dbStatus==="ok") sb.upsert("inauguracao",{id:unitId,etapa_checks:newEtapaChecks,updated_at:new Date().toISOString()},"id").catch(()=>{});
      return { ...u, etapaChecks: newEtapaChecks };
    }));
  }

  function getProgress(unit, etapaId) {
    const etapa = ETAPAS_GESTACAO.find(e => e.id === etapaId);
    const items = etapa?.id === "e1" ? ETAPA1_ITEMS : [];
    if (items.length === 0) return { done: 0, total: 0, pct: 0 };
    const checks = unit.etapaChecks?.[etapaId] || {};
    const done = items.filter(i => checks[i.id]).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  }

  const emGestacao = inauguracoes.filter(u => u.etapaAtual === "em_gestacao").length;
  const inauguradas = inauguracoes.filter(u => u.etapaAtual === "inaugurada").length;

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🐣 Inaugurações — Fase de Gestação</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>
            {emGestacao} em gestação · {inauguradas} inauguradas recentemente
          </div>
        </div>
        <button onClick={()=>setShowAddForm(!showAddForm)} style={btnSt(C.bercario)}>+ Nova unidade</button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{background:C.card,border:`1px solid ${C.bercario}44`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar nova unidade em gestação</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <label style={labelSt}>Nome da unidade</label>
              <input list="all-units" value={newUnit.nome} onChange={e=>setNewUnit({...newUnit,nome:e.target.value})} placeholder="Ex: SP - CAMPINAS" style={inputSt} />
              <datalist id="all-units">{units.map(u=><option key={u.id} value={u.name}/>)}</datalist>
            </div>
            <div>
              <label style={labelSt}>Data assinatura contrato</label>
              <input type="date" value={newUnit.dataContrato} onChange={e=>setNewUnit({...newUnit,dataContrato:e.target.value})} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Data criação grupo WPP</label>
              <input type="date" value={newUnit.dataGrupoWPP} onChange={e=>setNewUnit({...newUnit,dataGrupoWPP:e.target.value})} style={inputSt} />
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addUnit} style={btnSt(C.bercario)}>Registrar</button>
            <button onClick={()=>setShowAddForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {STATUS_OPTIONS.map(s=>(
          <button key={s.id} onClick={()=>setFilterStatus(s.id)} style={{
            padding:"4px 12px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===s.id?s.cor:C.cardBorder}`,
            background:filterStatus===s.id?`${s.cor}22`:"transparent",
            color:filterStatus===s.id?s.cor:C.textMuted,
          }}>{s.label}</button>
        ))}
      </div>

      {/* Units list */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:32,marginBottom:10}}>🐣</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Nenhuma unidade nessa fase</div>
          <div style={{fontSize:12,marginTop:4}}>Registre uma nova unidade em gestação acima</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(unit => {
            const e1prog = getProgress(unit, "e1");
            const preInaugMeet = PRE_INAUG_MEETINGS.find(m =>
              m.unidade === unit.nome || (m.extra||[]).includes(unit.nome)
            );
            const isOpen = activeUnit?.id === unit.id;
            const daysInProcess = unit.dataContrato ? Math.floor((TODAY - new Date(unit.dataContrato)) / 86400000) : null;

            return (
              <div key={unit.id} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
                {/* Header row */}
                <div onClick={()=>setActiveUnit(isOpen?null:unit)}
                  style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:700,color:C.textPrimary}}>{unit.nome}</span>
                      <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,
                        background:unit.etapaAtual==="inaugurada"?`${C.verde}22`:`${C.bercario}22`,
                        color:unit.etapaAtual==="inaugurada"?C.verde:C.bercario,
                        border:`1px solid ${unit.etapaAtual==="inaugurada"?C.verde:C.bercario}44`}}>
                        {unit.etapaAtual==="inaugurada"?"✅ Inaugurada":"🐣 Em gestação"}
                      </span>
                      {preInaugMeet && <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${C.azul}22`,color:C.azul}}>Reunião pré-inaug ✓</span>}
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {unit.dataContrato&&<span style={{fontSize:10,color:C.textMuted}}>📝 Contrato: {fmtDate(unit.dataContrato)}</span>}
                      {unit.dataGrupoWPP&&<span style={{fontSize:10,color:C.textMuted}}>💬 Grupo WPP: {fmtDate(unit.dataGrupoWPP)}</span>}
                      {daysInProcess!==null&&<span style={{fontSize:10,color:C.textMuted}}>{daysInProcess} dias no processo</span>}
                      {unit.dataInauguracao&&<span style={{fontSize:10,color:C.verde}}>🎉 Inaugurou: {fmtDate(unit.dataInauguracao)}</span>}
                    </div>
                  </div>

                  {/* Etapa 1 progress */}
                  <div style={{width:100,flexShrink:0}}>
                    <div style={{fontSize:9,color:C.textMuted,marginBottom:2}}>Etapa 1: {e1prog.done}/{e1prog.total}</div>
                    <ProgressBar pct={e1prog.pct} color={C.laranja} height={4} />
                  </div>
                  <span style={{fontSize:11,color:C.textMuted}}>{isOpen?"▲":"▼"}</span>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{borderTop:`1px solid ${C.cardBorder}`,padding:"14px 16px"}}>

                    {/* Quick actions */}
                    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                      <div>
                        <label style={labelSt}>Status</label>
                        <select value={unit.etapaAtual} onChange={e=>updateUnit(unit.id,{etapaAtual:e.target.value})} style={inputSt}>
                          <option value="em_gestacao">🐣 Em gestação</option>
                          <option value="inaugurada">✅ Inaugurada</option>
                        </select>
                      </div>
                      {unit.etapaAtual==="inaugurada"&&(
                        <div>
                          <label style={labelSt}>Data de inauguração</label>
                          <input type="date" value={unit.dataInauguracao||""} onChange={e=>updateUnit(unit.id,{dataInauguracao:e.target.value})} style={inputSt} />
                        </div>
                      )}
                    </div>

                    {/* Reunião pré-inauguração */}
                    {preInaugMeet && (
                      <div style={{background:`${C.azul}11`,border:`1px solid ${C.azul}33`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.azul,marginBottom:2}}>📋 Reunião pré-inauguração registrada</div>
                        <div style={{fontSize:11,color:C.textMuted}}>{fmtDate(preInaugMeet.data)} · {preInaugMeet.franqueado}</div>
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <a href={`https://docs.google.com/document/d/${preInaugMeet.docId}/edit`} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:C.azul,textDecoration:"none"}}>🔗 Ver ata</a>
                          {preInaugMeet.gravacao&&<a href={preInaugMeet.gravacao} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:C.verde,textDecoration:"none"}}>📹 Gravação</a>}
                        </div>
                      </div>
                    )}

                    {/* Etapas */}
                    {ETAPAS_GESTACAO.map(etapa => {
                      const prog = getProgress(unit, etapa.id);
                      const items = etapa.id === "e1" ? ETAPA1_ITEMS : [];
                      const grupos = [...new Set(items.map(i=>i.grupo))];
                      return (
                        <div key={etapa.id} style={{marginBottom:12,border:`1px solid ${etapa.cor}33`,borderRadius:10,overflow:"hidden"}}>
                          <div style={{padding:"8px 12px",background:`${etapa.cor}11`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <span style={{fontSize:12,fontWeight:700,color:etapa.cor}}>{etapa.nome}</span>
                              <span style={{fontSize:10,color:C.textMuted,marginLeft:8}}>→ {etapa.resp}</span>
                              {etapa.pendente&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${C.amarelo}33`,color:C.amareloTxt,marginLeft:6}}>PDF pendente</span>}
                            </div>
                            {prog.total>0&&(
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:10,fontWeight:700,color:prog.pct===100?C.verde:etapa.cor}}>{prog.done}/{prog.total}</span>
                                <div style={{width:60}}><ProgressBar pct={prog.pct} color={etapa.cor} height={4}/></div>
                              </div>
                            )}
                          </div>
                          {etapa.pendente ? (
                            <div style={{padding:"8px 12px",fontSize:11,color:C.textMuted}}>⏳ Checklist pendente — PDF das etapas 3 e 4 ainda não recebido.</div>
                          ) : (
                            <div style={{padding:"6px 0"}}>
                              {grupos.map(grupo=>(
                                <div key={grupo}>
                                  <div style={{padding:"4px 12px",fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",background:C.inset}}>{grupo}</div>
                                  {items.filter(i=>i.grupo===grupo).map(item=>{
                                    const checked = unit.etapaChecks?.[etapa.id]?.[item.id] || false;
                                    return (
                                      <label key={item.id} style={{
                                        display:"flex",alignItems:"flex-start",gap:10,padding:"7px 12px",cursor:"pointer",
                                        background:checked?`${etapa.cor}08`:"transparent",
                                        borderBottom:`1px solid ${C.cardBorder}`,
                                      }}>
                                        <input type="checkbox" checked={checked}
                                          onChange={e=>toggleCheck(unit.id,etapa.id,item.id,e.target.checked)}
                                          style={{marginTop:2,flexShrink:0,accentColor:etapa.cor}} />
                                        <div style={{flex:1}}>
                                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                                            <span style={{fontSize:12,fontWeight:600,color:checked?C.textMuted:C.textPrimary,
                                              textDecoration:checked?"line-through":"none"}}>{item.titulo}</span>
                                            {item.opcional&&<span style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:`${C.textMuted}22`,color:C.textMuted}}>opcional</span>}
                                          </div>
                                          {item.desc&&<div style={{fontSize:10,color:C.textMuted,marginTop:1,lineHeight:1.4}}>{item.desc}</div>}
                                          <div style={{display:"flex",gap:8,marginTop:2}}>
                                            <span style={{fontSize:9,color:etapa.cor}}>→ {item.resp}</span>
                                            {item.apoio&&<span style={{fontSize:9,color:C.textMuted}}>apoio: {item.apoio}</span>}
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Observações */}
                    <div>
                      <label style={labelSt}>Observações</label>
                      <textarea value={unit.observacoes||""} onChange={e=>updateUnit(unit.id,{observacoes:e.target.value})}
                        placeholder="Notas sobre o processo de inauguração..." style={{...inputSt,height:55,resize:"vertical"}} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
