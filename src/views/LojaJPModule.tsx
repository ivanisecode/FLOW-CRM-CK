import { useState, useEffect } from "react";
import { JP_STAFF } from "../data/jpStaff";
import { C, TODAY } from "../lib/constants";
import { STATUS_TASK, fmtDate } from "../lib/helpers";
import { btnSt, inputSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// ─── JP LOJA MODULE ───────────────────────────────────────────
export function LojaJPModule({ dbStatus }) {
  const [staffTasks, setStaffTasks] = useState(
    JP_STAFF.reduce((acc,s)=>({...acc,[s.id]:[]}),{})
  );
  const [activeStaff, setActiveStaff] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({titulo:"",prioridade:"Alta",status:"nao_iniciado",prazo:"",observacao:""});

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("loja_jp", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) {
        setStaffTasks(JP_STAFF.reduce((acc,s)=>({
          ...acc,
          [s.id]: rows.filter(r=>r.staff_id===s.id).map(r=>({
            id:r.id, titulo:r.titulo, prioridade:r.prioridade,
            status:r.status, prazo:r.prazo||"", observacao:r.observacao||"",
          })),
        }),{}));
      }
    }).catch(()=>{});
  }, [dbStatus]);

  function addTask(staffId) {
    if(!newTask.titulo.trim()) return;
    setStaffTasks(prev=>({...prev,[staffId]:[...prev[staffId],{...newTask,id:Date.now(),criadoEm:TODAY.toISOString().slice(0,10)}]}));
    setNewTask({titulo:"",prioridade:"Alta",status:"nao_iniciado",prazo:"",observacao:""});
    setShowForm(false);
  }

  function updateTask(staffId,taskId,updates) {
    setStaffTasks(prev=>({...prev,[staffId]:prev[staffId].map(t=>t.id===taskId?{...t,...updates}:t)}));
  }

  const totalOpen = Object.values(staffTasks).flat().filter(t=>t.status!=="concluido"&&t.status!=="cancelado").length;
  const totalDone = Object.values(staffTasks).flat().filter(t=>t.status==="concluido").length;

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🏠 Loja JP — João Pessoa</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Unidade 01 · Equipe de 4 funcionários · {totalOpen} tarefas abertas · {totalDone} concluídas</div>
      </div>

      {/* Staff cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
        {JP_STAFF.map(staff=>{
          const tasks = staffTasks[staff.id]||[];
          const open = tasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
          const isActive = activeStaff===staff.id;
          return (
            <div key={staff.id} style={{background:C.card,border:`1px solid ${isActive?staff.cor:C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
              <div onClick={()=>setActiveStaff(isActive?null:staff.id)}
                style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`${staff.cor}22`,border:`2px solid ${staff.cor}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:staff.cor}}>
                    {staff.nome[0]}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{staff.nome}</div>
                    <div style={{fontSize:11,color:staff.cor}}>{staff.funcao}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:open.length>0?C.amarelo:C.verde}}>{open.length}</div>
                  <div style={{fontSize:9,color:C.textMuted}}>abertas</div>
                </div>
              </div>

              {isActive&&(
                <div style={{borderTop:`1px solid ${C.cardBorder}`,padding:"10px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:11,color:C.textMuted}}>{open.length} aberta(s)</span>
                    <button onClick={()=>setShowForm(staff.id)} style={{background:"none",border:`1px solid ${staff.cor}`,color:staff.cor,fontSize:10,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>+ Tarefa</button>
                  </div>

                  {showForm===staff.id&&(
                    <div style={{background:C.inset,borderRadius:8,padding:10,marginBottom:8}}>
                      <input value={newTask.titulo} onChange={e=>setNewTask({...newTask,titulo:e.target.value})} placeholder="Título da tarefa" style={{...inputSt,marginBottom:6}} />
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        <select value={newTask.prioridade} onChange={e=>setNewTask({...newTask,prioridade:e.target.value})} style={inputSt}>
                          <option>Alta</option><option>Média</option><option>Baixa</option>
                        </select>
                        <input type="date" value={newTask.prazo} onChange={e=>setNewTask({...newTask,prazo:e.target.value})} style={inputSt} />
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>addTask(staff.id)} style={btnSt(staff.cor,staff.cor==="#f9d856"?"#000":"#fff")}>Criar</button>
                        <button onClick={()=>setShowForm(null)} style={btnSt("transparent",C.textMuted)}>×</button>
                      </div>
                    </div>
                  )}

                  {tasks.length===0?(
                    <div style={{fontSize:11,color:C.textMuted,textAlign:"center",padding:"12px 0"}}>Sem tarefas</div>
                  ):(
                    tasks.map(t=>{
                      const sc=STATUS_TASK[t.status];
                      return (
                        <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                          <select value={t.status} onChange={e=>updateTask(staff.id,t.id,{status:e.target.value})}
                            style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:9,borderRadius:4,padding:"1px 3px",cursor:"pointer",flexShrink:0,marginTop:2}}>
                            {Object.entries(STATUS_TASK).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,color:t.status==="concluido"?C.textMuted:C.textPrimary,textDecoration:t.status==="concluido"?"line-through":"none"}}>{t.titulo}</div>
                            {t.prazo&&<div style={{fontSize:9,color:C.textMuted}}>até {fmtDate(t.prazo)}</div>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* JP quick stats */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Resumo Loja JP</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {label:"Total peças",value:"523",color:C.textPrimary},
            {label:"Disponíveis",value:"267",color:C.verde},
            {label:"Em manutenção",value:"83",color:C.red},
          ].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:10,color:C.textMuted}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:11,color:C.textMuted,textAlign:"center"}}>
          Dados do sistema meuclubkids.com.br · Atualizado 03/06/2026 · 
          <a href="#" style={{color:C.azul,textDecoration:"none",marginLeft:4}}>Módulo manutenção JP →</a>
        </div>
      </div>
    </div>
  );
}
