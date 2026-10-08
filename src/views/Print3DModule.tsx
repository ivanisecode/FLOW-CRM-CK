import { useState, useEffect } from "react";
import { C, TODAY } from "../lib/constants";
import { fmtDate } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// ─── 3D PRINT MODULE ─────────────────────────────────────────
export function Print3DModule({ dbStatus }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    unidade:"",descricao:"",temProjeto:false,
    statusProjeto:"aguardando_junior",prazoJunior:"",
    statusImpressao:"na_fila",dataImpressao:"",
    dataEnvio:"",rastreio:"",dataEntrega:"",responsavel:"Will",observacoes:""
  });

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("print3d", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) setItems(rows.map(r => ({
        id: r.id, unidade: r.unidade, descricao: r.descricao,
        temProjeto: r.tem_projeto, statusProjeto: r.status_projeto,
        prazoJunior: r.prazo_junior||"", statusImpressao: r.status_impressao,
        dataImpressao: r.data_impressao||"", dataEnvio: r.data_envio||"",
        rastreio: r.rastreio||"", dataEntrega: r.data_entrega||"",
        responsavel: r.responsavel, observacoes: r.observacoes||"",
        dataSolicitacao: r.data_solicitacao,
      })));
    }).catch(() => {});
  }, [dbStatus]);

  const STATUS_3D_PROJETO = {aguardando_junior:"Aguardando Júnior",projeto_em_andamento:"Projeto em andamento",projeto_pronto:"Projeto pronto"};
  const STATUS_3D_PRINT = {na_fila:"Na fila",imprimindo:"Imprimindo",pronto_para_envio:"Pronto p/ envio",enviado:"Enviado",entregue:"Entregue"};
  const statusColor = {aguardando_junior:C.red,projeto_em_andamento:C.amarelo,projeto_pronto:C.verde,na_fila:C.textMuted,imprimindo:C.laranja,pronto_para_envio:C.amarelo,enviado:C.azul,entregue:C.verde};

  function addItem() {
    if(!newItem.descricao.trim()) return;
    const entry = {...newItem,id:Date.now(),dataSolicitacao:TODAY.toISOString().slice(0,10)};
    setItems(prev=>[...prev,entry]);
    if(dbStatus==="ok") sb.post("print3d",{unidade:entry.unidade,descricao:entry.descricao,tem_projeto:entry.temProjeto,status_projeto:entry.statusProjeto,status_impressao:entry.statusImpressao,responsavel:entry.responsavel,data_solicitacao:entry.dataSolicitacao}).then(rows=>{if(rows&&rows[0]) setItems(prev=>prev.map(i=>i.id===entry.id?{...i,id:rows[0].id}:i));}).catch(()=>{});
    setNewItem({unidade:"",descricao:"",temProjeto:false,statusProjeto:"aguardando_junior",prazoJunior:"",statusImpressao:"na_fila",dataImpressao:"",dataEnvio:"",rastreio:"",dataEntrega:"",responsavel:"Will",observacoes:""});
    setShowForm(false);
  }

  function updateItem(id,updates) {
    setItems(prev=>prev.map(i=>i.id===id?{...i,...updates}:i));
    if(dbStatus==="ok" && typeof id==="number") {
      const m={};
      if(updates.statusProjeto!==undefined) m.status_projeto=updates.statusProjeto;
      if(updates.statusImpressao!==undefined) m.status_impressao=updates.statusImpressao;
      if(updates.responsavel!==undefined) m.responsavel=updates.responsavel;
      if(updates.prazoJunior!==undefined) m.prazo_junior=updates.prazoJunior||null;
      if(updates.dataImpressao!==undefined) m.data_impressao=updates.dataImpressao||null;
      if(updates.dataEnvio!==undefined) m.data_envio=updates.dataEnvio||null;
      if(updates.rastreio!==undefined) m.rastreio=updates.rastreio;
      if(updates.dataEntrega!==undefined) m.data_entrega=updates.dataEntrega||null;
      if(updates.observacoes!==undefined) m.observacoes=updates.observacoes;
      if(Object.keys(m).length){m.updated_at=new Date().toISOString(); sb.patch("print3d",id,m).catch(()=>{});}
    }
  }

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🖨️ Impressão 3D</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{items.filter(i=>i.statusImpressao!=="entregue").length} pedidos ativos · {items.filter(i=>i.statusImpressao==="entregue").length} entregues</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.azul)}>+ Novo pedido</button>
      </div>

      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.azul}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Novo pedido 3D</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <label style={labelSt}>Unidade solicitante</label>
              <input value={newItem.unidade} onChange={e=>setNewItem({...newItem,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Responsável</label>
              <select value={newItem.responsavel} onChange={e=>setNewItem({...newItem,responsavel:e.target.value})} style={inputSt}>
                <option>Will</option><option>Ivanise</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <label style={labelSt}>Descrição da peça</label>
            <textarea value={newItem.descricao} onChange={e=>setNewItem({...newItem,descricao:e.target.value})} placeholder="Descrição detalhada da peça necessária" style={{...inputSt,height:55,resize:"vertical"}} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:C.textPrimary}}>
              <input type="checkbox" checked={newItem.temProjeto} onChange={e=>setNewItem({...newItem,temProjeto:e.target.checked})} />
              Já existe projeto 3D
            </label>
          </div>
          {!newItem.temProjeto&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <label style={labelSt}>Status projeto (Júnior)</label>
                <select value={newItem.statusProjeto} onChange={e=>setNewItem({...newItem,statusProjeto:e.target.value})} style={inputSt}>
                  {Object.entries(STATUS_3D_PROJETO).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Prazo para Júnior</label>
                <input type="date" value={newItem.prazoJunior} onChange={e=>setNewItem({...newItem,prazoJunior:e.target.value})} style={inputSt} />
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button onClick={addItem} style={btnSt(C.azul)}>Criar pedido</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {items.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:36,marginBottom:10}}>🖨️</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Nenhum pedido 3D ainda</div>
          <div style={{fontSize:12,marginTop:4}}>Clique em "+ Novo pedido" para registrar</div>
        </div>
      ):(
        <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
          {items.map((item,i)=>{
            const projReady = item.temProjeto || item.statusProjeto==="projeto_pronto";
            const printSc = STATUS_3D_PRINT[item.statusImpressao];
            const projSc = item.temProjeto ? null : STATUS_3D_PROJETO[item.statusProjeto];
            return (
              <div key={item.id} style={{borderBottom:i<items.length-1?`1px solid ${C.cardBorder}`:"none",padding:"12px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{item.descricao}</div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{item.unidade} · Solicitado {fmtDate(item.dataSolicitacao)}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    {!item.temProjeto&&(
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${statusColor[item.statusProjeto]}22`,color:statusColor[item.statusProjeto]}}>
                        {projSc}
                      </span>
                    )}
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${statusColor[item.statusImpressao]}22`,color:statusColor[item.statusImpressao]}}>
                      {printSc}
                    </span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {!item.temProjeto&&!projReady&&(
                    <select value={item.statusProjeto} onChange={e=>updateItem(item.id,{statusProjeto:e.target.value})}
                      style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:statusColor[item.statusProjeto],fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                      {Object.entries(STATUS_3D_PROJETO).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  )}
                  <select value={item.statusImpressao} onChange={e=>updateItem(item.id,{statusImpressao:e.target.value})}
                    style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:statusColor[item.statusImpressao],fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                    {Object.entries(STATUS_3D_PRINT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  {item.statusImpressao==="enviado"&&(
                    <input value={item.rastreio} onChange={e=>updateItem(item.id,{rastreio:e.target.value})}
                      placeholder="Código rastreio" style={{...inputSt,width:150,fontSize:11,padding:"3px 8px"}} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
