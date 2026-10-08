import { useState, useEffect } from "react";
import { C, TODAY } from "../lib/constants";
import { fmtDate } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// ─── DIÁRIO DE BORDO ─────────────────────────────────────────
export function DiarioView({ units, dbStatus }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ data:TODAY.toISOString().slice(0,10), canal:"Grupo WhatsApp", assunto:"", detalhe:"", responsavel:"Ivanise", unidade:"", prioridade:"Média" });

  // Load from Supabase
  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("diario", "?select=*&order=data.desc").then(rows => {
      if (rows?.length) setEntries(rows.map(r => ({
        id: r.id, data: r.data, canal: r.canal, unidade: r.unidade,
        assunto: r.assunto, detalhe: r.detalhe, responsavel: r.responsavel,
        prioridade: r.prioridade, status: r.status,
      })));
    }).catch(() => {});
  }, [dbStatus]);

  async function addEntry() {
    if(!form.assunto.trim()) return;
    const newEntry = {...form, id: crypto.randomUUID(), status:"pendente", criadoEm: new Date().toISOString()};
    setEntries(prev=>[newEntry,...prev]);
    setForm({...form, assunto:"", detalhe:"", unidade:""});
    if (dbStatus === "ok") {
      try {
        await sb.post("diario", {
          id: newEntry.id, data: newEntry.data, canal: newEntry.canal,
          unidade: newEntry.unidade, assunto: newEntry.assunto,
          detalhe: newEntry.detalhe, responsavel: newEntry.responsavel,
          prioridade: newEntry.prioridade, status: "pendente",
        });
      } catch(e) { console.warn("Diário save error:", e.message); }
    }
  }

  async function resolveEntry(id) {
    setEntries(prev=>prev.map(x=>x.id===id?{...x,status:"resolvido"}:x));
    if (dbStatus === "ok") {
      try { await sb.patch("diario", id, {status:"resolvido",updated_at:new Date().toISOString()}); }
      catch(e) { console.warn(e.message); }
    }
  }

  const pendentes = entries.filter(e=>e.status==="pendente");
  const resolvidos = entries.filter(e=>e.status==="resolvido");

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>📓 Diário de Bordo</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Pontos de grupos e conversas que viraram pendência</div>
      </div>

      {/* Form */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:12}}>Registrar ponto</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <label style={labelSt}>Data</label>
            <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Canal / origem</label>
            <select value={form.canal} onChange={e=>setForm({...form,canal:e.target.value})} style={inputSt}>
              {["Grupo WhatsApp","DM WhatsApp","Grupo Telegram","Ligação","Email","Reunião informal","Outro"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Unidade (se específica)</label>
            <input list="units-list" value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            <datalist id="units-list">{units.map(u=><option key={u.id} value={u.name}/>)}</datalist>
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <label style={labelSt}>Assunto / pendência</label>
          <input value={form.assunto} onChange={e=>setForm({...form,assunto:e.target.value})} placeholder="O que foi levantado?" style={inputSt} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={labelSt}>Detalhes (opcional)</label>
          <textarea value={form.detalhe} onChange={e=>setForm({...form,detalhe:e.target.value})} placeholder="Mais contexto..." style={{...inputSt,height:55,resize:"vertical"}} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <label style={labelSt}>Responsável</label>
            <select value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} style={inputSt}>
              <option>Ivanise</option><option>Will</option><option>Franqueado</option><option>Júnior</option><option>Mariana</option><option>Outro</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Prioridade</label>
            <select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})} style={inputSt}>
              <option>Alta</option><option>Média</option><option>Baixa</option>
            </select>
          </div>
        </div>
        <button onClick={addEntry} style={btnSt(C.laranja)}>Registrar</button>
      </div>

      {/* Pending */}
      {pendentes.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Pendentes ({pendentes.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
            {pendentes.map((e,i)=>{
              const prioColor={Alta:C.red,Média:C.amarelo,Baixa:C.textMuted};
              return(
                <div key={e.id} style={{padding:"10px 14px",borderBottom:i<pendentes.length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"flex-start",gap:12}}>
                  <button onClick={()=>resolveEntry(e.id)}
                    style={{width:20,height:20,borderRadius:4,border:`2px solid ${C.cardBorder}`,background:"transparent",cursor:"pointer",flexShrink:0,marginTop:2}} />
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{e.assunto}</div>
                    {e.detalhe&&<div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{e.detalhe}</div>}
                    <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:prioColor[e.prioridade]}}>● {e.prioridade}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{e.canal}</span>
                      {e.unidade&&<span style={{fontSize:10,color:C.azul}}>{e.unidade}</span>}
                      <span style={{fontSize:10,color:C.textMuted}}>→ {e.responsavel}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{fmtDate(e.data)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resolvidos.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Resolvidos ({resolvidos.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden",opacity:0.6}}>
            {resolvidos.slice(0,5).map((e,i)=>(
              <div key={e.id} style={{padding:"8px 14px",borderBottom:i<resolvidos.slice(0,5).length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14,color:C.verde}}>✓</span>
                <div style={{fontSize:12,color:C.textMuted,textDecoration:"line-through"}}>{e.assunto}</div>
                <span style={{fontSize:10,color:C.textMuted,marginLeft:"auto"}}>{fmtDate(e.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length===0&&(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:36,marginBottom:10}}>📓</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Diário vazio</div>
          <div style={{fontSize:12,marginTop:4}}>Use este espaço para registrar pontos dos grupos que precisam de atenção</div>
        </div>
      )}
    </div>
  );
}
