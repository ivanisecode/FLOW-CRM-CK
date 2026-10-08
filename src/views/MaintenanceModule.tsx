import { useState, useEffect } from "react";
import { JP_MANUTENCAO_INICIAL } from "../data/jpManutencao";
import { C, TODAY } from "../lib/constants";
import { STATUS_MANUT } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// ─── MAINTENANCE MODULE (JP) ──────────────────────────────────
export function MaintenanceModule({ dbStatus }) {
  const [items, setItems] = useState(JP_MANUTENCAO_INICIAL);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({nome:"",motivo:"",status:"aguardando_orcamento",responsavel:"Will"});

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("manutencao", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) setItems(rows.map(r => ({
        id: r.id, nome: r.nome, motivo: r.motivo, status: r.status,
        responsavel: r.responsavel, orcamentoLink: r.orcamento_link||"",
        orcamentoValor: r.orcamento_valor||"", aprovacao: r.aprovacao||"pendente",
        dataEntrada: r.data_entrada, dataAprovacao: r.data_aprovacao,
        dataEnvio: r.data_envio, dataChegada: r.data_chegada,
        dataManutencao: r.data_manutencao, dataRetorno: r.data_retorno,
        enviadoPara: JSON.parse(r.enviado_para||"[]"), observacoes: r.observacoes||"",
      })));
    }).catch(() => {});
  }, [dbStatus]);

  const filtered = items.filter(i => {
    const ms = i.status !== "retornou";
    const ss = filterStatus==="todos" || i.status===filterStatus;
    const qs = !search || i.nome.toLowerCase().includes(search.toLowerCase());
    return ms && ss && qs;
  });

  const active = items.filter(i=>i.status!=="retornou");
  const byStatus = Object.keys(STATUS_MANUT).reduce((acc,k)=>({...acc,[k]:active.filter(i=>i.status===k).length}),{});

  function updateItem(id, updates) {
    setItems(prev=>prev.map(i=>i.id===id?{...i,...updates}:i));
    if(selected?.id===id) setSelected(s=>({...s,...updates}));
    if(dbStatus==="ok" && typeof id === "number") {
      const dbUpdates = {};
      if(updates.status!==undefined) dbUpdates.status=updates.status;
      if(updates.responsavel!==undefined) dbUpdates.responsavel=updates.responsavel;
      if(updates.orcamentoLink!==undefined) dbUpdates.orcamento_link=updates.orcamentoLink;
      if(updates.orcamentoValor!==undefined) dbUpdates.orcamento_valor=updates.orcamentoValor;
      if(updates.aprovacao!==undefined) dbUpdates.aprovacao=updates.aprovacao;
      if(updates.observacoes!==undefined) dbUpdates.observacoes=updates.observacoes;
      if(updates.dataAprovacao!==undefined) dbUpdates.data_aprovacao=updates.dataAprovacao;
      if(updates.dataEnvio!==undefined) dbUpdates.data_envio=updates.dataEnvio;
      if(updates.dataChegada!==undefined) dbUpdates.data_chegada=updates.dataChegada;
      if(updates.dataManutencao!==undefined) dbUpdates.data_manutencao=updates.dataManutencao;
      if(updates.dataRetorno!==undefined) dbUpdates.data_retorno=updates.dataRetorno;
      if(updates.enviadoPara!==undefined) dbUpdates.enviado_para=JSON.stringify(updates.enviadoPara);
      if(Object.keys(dbUpdates).length) { dbUpdates.updated_at=new Date().toISOString(); sb.patch("manutencao",id,dbUpdates).catch(()=>{}); }
    }
  }

  function addItem() {
    if(!newItem.nome.trim()) return;
    const entry = {...newItem,id:Date.now(),orcamentoLink:"",orcamentoValor:"",aprovacao:"pendente",dataEntrada:TODAY.toISOString().slice(0,10),dataAprovacao:null,dataEnvio:null,dataChegada:null,dataManutencao:null,dataRetorno:null,enviadoPara:[],observacoes:""};
    setItems(prev=>[...prev,entry]);
    if(dbStatus==="ok") sb.post("manutencao",{nome:entry.nome,motivo:entry.motivo,status:entry.status,responsavel:entry.responsavel,aprovacao:"pendente",data_entrada:entry.dataEntrada,enviado_para:"[]"}).then(rows=>{if(rows&&rows[0]) setItems(prev=>prev.map(i=>i.id===entry.id?{...i,id:rows[0].id}:i));}).catch(()=>{});
    setNewItem({nome:"",motivo:"",status:"aguardando_orcamento",responsavel:"Will"});
    setShowForm(false);
  }

  const FLOW_STEPS = [
    {key:"aguardando_orcamento",label:"Orçamento"},
    {key:"orcamento_enviado",label:"Enviado"},
    {key:"aguardando_aprovacao",label:"Aprovação"},
    {key:"aprovado",label:"Aprovado"},
    {key:"aguardando_peca",label:"Aguard. peça"},
    {key:"em_manutencao",label:"Em manutenção"},
    {key:"pronto",label:"Pronto"},
    {key:"retornou",label:"Retornou"},
  ];

  const stepIdx = (s) => FLOW_STEPS.findIndex(f=>f.key===s);

  return (
    <div style={{padding:"14px 14px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🔧 Manutenção — JP (João Pessoa)</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{active.length} itens ativos · {items.filter(i=>i.status==="retornou").length} retornaram ao estoque</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.laranja)}>+ Novo item</button>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {Object.entries(STATUS_MANUT).filter(([k])=>byStatus[k]>0).map(([k,v])=>(
          <div key={k} style={{background:C.card,border:`1px solid ${v.color}33`,borderRadius:8,padding:"6px 12px",flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:800,color:v.color}}>{byStatus[k]}</div>
            <div style={{fontSize:9,color:C.textMuted,whiteSpace:"nowrap"}}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* New item form */}
      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.laranja}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar item em manutenção</div>
          <input value={newItem.nome} onChange={e=>setNewItem({...newItem,nome:e.target.value})} placeholder="Nome do brinquedo" style={{...inputSt,marginBottom:8}} />
          <textarea value={newItem.motivo} onChange={e=>setNewItem({...newItem,motivo:e.target.value})} placeholder="Motivo / problema identificado" style={{...inputSt,height:60,resize:"vertical",marginBottom:8}} />
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <select value={newItem.status} onChange={e=>setNewItem({...newItem,status:e.target.value})} style={inputSt}>
              {Object.entries(STATUS_MANUT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={newItem.responsavel} onChange={e=>setNewItem({...newItem,responsavel:e.target.value})} style={inputSt}>
              <option>Will</option><option>Ivanise</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addItem} style={btnSt(C.laranja)}>Registrar</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar item..." style={{...inputSt,width:200}} />
        {["todos",...Object.keys(STATUS_MANUT)].map(k=>(
          <button key={k} onClick={()=>setFilterStatus(k)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===k?C.laranja:C.cardBorder}`,
            background:filterStatus===k?`${C.laranja}22`:"transparent",
            color:filterStatus===k?C.laranja:C.textMuted,
          }}>{k==="todos"?"Todos":STATUS_MANUT[k]?.label}</button>
        ))}
      </div>

      {/* Items list */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        {filtered.map((item,i)=>{
          const sc = STATUS_MANUT[item.status];
          const si = stepIdx(item.status);
          return (
            <div key={item.id} style={{
              borderBottom:i<filtered.length-1?`1px solid ${C.cardBorder}`:"none",
              padding:"12px 16px", cursor:"pointer",
              background:selected?.id===item.id?C.cardHover:"transparent",
            }} onClick={()=>setSelected(selected?.id===item.id?null:item)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.textPrimary,marginBottom:4}}>{item.nome}</div>
                  {/* Flow bar */}
                  <div style={{display:"flex",gap:2,marginBottom:4}}>
                    {FLOW_STEPS.map((step,idx)=>(
                      <div key={step.key} style={{
                        height:3, flex:1, borderRadius:2,
                        background: idx<=si ? sc.color : C.cardBorder,
                      }} />
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,color:sc.color}}>{sc.label}</span>
                    {item.motivo&&<span style={{fontSize:10,color:C.textMuted}}>· {item.motivo.slice(0,40)}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,marginLeft:12}}>
                  <select value={item.status} onChange={e=>{e.stopPropagation();updateItem(item.id,{status:e.target.value})}}
                    onClick={e=>e.stopPropagation()}
                    style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                    {Object.entries(STATUS_MANUT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Expanded edit */}
              {selected?.id===item.id&&(
                <div style={{marginTop:12,padding:12,background:C.inset,borderRadius:8}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <label style={labelSt}>Orçamento (R$)</label>
                      <input value={item.orcamentoValor} onChange={e=>updateItem(item.id,{orcamentoValor:e.target.value})} placeholder="Valor do orçamento" style={inputSt} />
                    </div>
                    <div>
                      <label style={labelSt}>Link do orçamento (Drive)</label>
                      <input value={item.orcamentoLink} onChange={e=>updateItem(item.id,{orcamentoLink:e.target.value})} placeholder="https://drive.google.com/..." style={inputSt} />
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={labelSt}>Enviado para aprovação</label>
                    <div style={{display:"flex",gap:8}}>
                      {["Júnior","Mariana"].map(p=>(
                        <label key={p} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,color:C.textMuted}}>
                          <input type="checkbox" checked={(item.enviadoPara||[]).includes(p)}
                            onChange={e=>{
                              const arr = item.enviadoPara||[];
                              updateItem(item.id,{enviadoPara:e.target.checked?[...arr,p]:arr.filter(x=>x!==p)});
                            }} />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                    {[["dataEntrada","Entrada manut."],["dataEnvio","Envio peça"],["dataChegada","Chegada peça"],["dataManutencao","Início manut."],["dataRetorno","Retorno estoque"]].slice(0,3).map(([k,l])=>(
                      <div key={k}>
                        <label style={labelSt}>{l}</label>
                        <input type="date" value={item[k]||""} onChange={e=>updateItem(item.id,{[k]:e.target.value})} style={inputSt} />
                      </div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    {[["dataManutencao","Início manut."],["dataRetorno","Retorno estoque"]].map(([k,l])=>(
                      <div key={k}>
                        <label style={labelSt}>{l}</label>
                        <input type="date" value={item[k]||""} onChange={e=>updateItem(item.id,{[k]:e.target.value})} style={inputSt} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={labelSt}>Observações</label>
                    <textarea value={item.observacoes} onChange={e=>updateItem(item.id,{observacoes:e.target.value})}
                      placeholder="Notas adicionais..." style={{...inputSt,height:55,resize:"vertical"}} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted}}>Nenhum item encontrado</div>
        )}
      </div>
    </div>
  );
}
