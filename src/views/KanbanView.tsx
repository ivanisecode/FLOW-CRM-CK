import { useState, useMemo } from "react";
import { fmtDate } from "../lib/helpers";

// ─── KANBAN ──────────────────────────────────────────────────

const KANBAN_COLS = [
  { id:"fazer",     label:"A Fazer",      color:"#ef4444", statuses:["nao_iniciado","pendente"] },
  { id:"andamento", label:"Em Andamento", color:"#6e81bf", statuses:["em_andamento"] },
  { id:"concluido", label:"Concluído",    color:"#2db870", statuses:["concluido"] },
];

const PRI_COLOR = { Alta:"#e03535", Média:"#a07800", Baixa:"#2db870" };
const RESP_COLOR = { Ivanise:"#f19134", Will:"#6e81bf" };

function KanbanCard({ task, unitName, onMove, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ titulo:task.titulo, responsavel:task.responsavel, prioridade:task.prioridade, observacao:task.observacao||"" });
  const priColor = PRI_COLOR[task.prioridade]||"#8a7e6e";
  const respColor = RESP_COLOR[task.responsavel]||"#2db870";
  const colId = KANBAN_COLS.find(c=>c.statuses.includes(task.status))?.id;
  const canLeft = colId==="andamento"||colId==="concluido";
  const canRight = colId==="fazer"||colId==="andamento";

  function saveEdit() {
    onEdit(task.id, form);
    setEditing(false);
  }

  if (editing) {
    return (
      <div style={{background:"#fff",border:"1.5px solid #6e81bf",borderRadius:8,padding:"12px",marginBottom:8,boxShadow:"0 2px 8px #0000001a"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#6e81bf",marginBottom:8}}>Editar tarefa</div>
        <input value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Título"
          style={{width:"100%",marginBottom:6,padding:"5px 8px",border:"1px solid #e8e0cd",borderRadius:5,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"}} />
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <select value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})}
            style={{flex:1,padding:"5px 8px",border:"1px solid #e8e0cd",borderRadius:5,fontSize:12,fontFamily:"inherit"}}>
            <option>Ivanise</option><option>Will</option><option>Franqueado</option>
          </select>
          <select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})}
            style={{flex:1,padding:"5px 8px",border:"1px solid #e8e0cd",borderRadius:5,fontSize:12,fontFamily:"inherit"}}>
            <option>Alta</option><option>Média</option><option>Baixa</option>
          </select>
        </div>
        <textarea value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})} placeholder="Observação..."
          style={{width:"100%",marginBottom:8,padding:"5px 8px",border:"1px solid #e8e0cd",borderRadius:5,fontSize:12,fontFamily:"inherit",resize:"vertical",height:56,boxSizing:"border-box"}} />
        <div style={{display:"flex",gap:6}}>
          <button onClick={saveEdit} style={{flex:1,padding:"5px 10px",background:"#6e81bf",color:"#fff",border:"none",borderRadius:5,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Salvar</button>
          <button onClick={()=>setEditing(false)} style={{flex:1,padding:"5px 10px",background:"#faf6ef",color:"#1a1a1a",border:"1px solid #e8e0cd",borderRadius:5,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"#fff",border:"1px solid #e8e0cd",borderRadius:8,padding:"10px 12px",marginBottom:8,boxShadow:"0 1px 3px #0000000d"}}>
      {unitName&&<div style={{fontSize:9,color:"#8a7e6e",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{unitName}</div>}
      <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",marginBottom:6,lineHeight:1.3}}>{task.titulo}</div>
      {task.observacao&&<div style={{fontSize:11,color:"#8a7e6e",marginBottom:6,lineHeight:1.4}}>{task.observacao}</div>}
      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap",marginBottom:8}}>
        <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${priColor}18`,color:priColor,fontWeight:700}}>{task.prioridade}</span>
        <span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${respColor}18`,color:respColor}}>👤 {task.responsavel}</span>
        {task.meetingData&&<span style={{fontSize:10,color:"#8a7e6e"}}>{fmtDate(task.meetingData)}</span>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>setEditing(true)} style={{fontSize:11,padding:"2px 8px",background:"#faf6ef",border:"1px solid #e8e0cd",borderRadius:4,cursor:"pointer",color:"#8a7e6e",fontFamily:"inherit"}}>✏️ Editar</button>
        <div style={{display:"flex",gap:4}}>
          {canLeft&&<button onClick={()=>onMove(task.id,"←")} style={{fontSize:12,padding:"2px 8px",background:"#faf6ef",border:"1px solid #e8e0cd",borderRadius:4,cursor:"pointer",color:"#8a7e6e"}}>←</button>}
          {canRight&&<button onClick={()=>onMove(task.id,"→")} style={{fontSize:12,padding:"2px 10px",background:"#6e81bf",border:"none",borderRadius:4,cursor:"pointer",color:"#fff",fontWeight:700}}>→</button>}
        </div>
      </div>
    </div>
  );
}

// Kanban per-unit (used in UnitDetail tab)
export function UnitKanban({ tasks, onMoveTask, onEditTask }) {
  const allTasks = (tasks||[]).filter(t=>t.status!=="cancelado");

  function move(taskId, direction) {
    const task = allTasks.find(t=>t.id===taskId);
    if(!task) return;
    let newStatus;
    if(direction==="→") {
      if(["nao_iniciado","pendente"].includes(task.status)) newStatus="em_andamento";
      else if(task.status==="em_andamento") newStatus="concluido";
    } else {
      if(task.status==="concluido") newStatus="em_andamento";
      else if(task.status==="em_andamento") newStatus="nao_iniciado";
    }
    if(newStatus) onMoveTask(taskId, newStatus);
  }

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {KANBAN_COLS.map(col=>{
        const colTasks = allTasks.filter(t=>col.statuses.includes(t.status));
        return (
          <div key={col.id} style={{background:"#faf6ef",border:"1px solid #f0e8d8",borderRadius:8,padding:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <div style={{width:8,height:8,borderRadius:4,background:col.color}} />
              <span style={{fontWeight:700,fontSize:12,color:"#1a1a1a"}}>{col.label}</span>
              <span style={{fontSize:11,color:"#8a7e6e",marginLeft:"auto"}}>{colTasks.length}</span>
            </div>
            {colTasks.length===0&&<div style={{textAlign:"center",padding:"18px 0",color:"#8a7e6e",fontSize:11}}>Vazio</div>}
            {colTasks.map(task=>(
              <KanbanCard key={task.id} task={task}
                onMove={(tid,dir)=>move(tid,dir)}
                onEdit={(tid,updates)=>onEditTask(tid,updates)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Kanban global view (menu item)
export function KanbanView({ units, onUpdateUnit }) {
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterResp, setFilterResp] = useState("all");

  const allTasks = useMemo(()=>
    units.flatMap(u=>(u.tasks||[])
      .filter(t=>t.status!=="cancelado")
      .map(t=>({...t,unitId:u.id,unitName:u.name}))
    )
  ,[units]);

  const filtered = useMemo(()=>allTasks.filter(t=>{
    if(filterUnit!=="all"&&String(t.unitId)!==filterUnit) return false;
    if(filterResp!=="all"&&t.responsavel!==filterResp) return false;
    return true;
  }),[allTasks,filterUnit,filterResp]);

  const byCol = {
    fazer: filtered.filter(t=>["nao_iniciado","pendente"].includes(t.status)).length,
    andamento: filtered.filter(t=>t.status==="em_andamento").length,
    concluido: filtered.filter(t=>t.status==="concluido").length,
  };

  const byUser = useMemo(()=>["Ivanise","Will"].map(name=>({
    name,
    fazer:   filtered.filter(t=>t.responsavel===name&&["nao_iniciado","pendente"].includes(t.status)).length,
    andamento:filtered.filter(t=>t.responsavel===name&&t.status==="em_andamento").length,
    concluido:filtered.filter(t=>t.responsavel===name&&t.status==="concluido").length,
    total:   filtered.filter(t=>t.responsavel===name).length,
  })),[filtered]);

  function moveTask(taskId, unitId, direction) {
    const unit = units.find(u=>u.id===unitId);
    if(!unit) return;
    const task = (unit.tasks||[]).find(t=>t.id===taskId);
    if(!task) return;
    let newStatus;
    if(direction==="→") {
      if(["nao_iniciado","pendente"].includes(task.status)) newStatus="em_andamento";
      else if(task.status==="em_andamento") newStatus="concluido";
    } else {
      if(task.status==="concluido") newStatus="em_andamento";
      else if(task.status==="em_andamento") newStatus="nao_iniciado";
    }
    if(!newStatus) return;
    onUpdateUnit({...unit,tasks:(unit.tasks||[]).map(t=>t.id===taskId?{...t,status:newStatus}:t)});
  }

  function editTask(taskId, unitId, updates) {
    const unit = units.find(u=>u.id===unitId);
    if(!unit) return;
    onUpdateUnit({...unit,tasks:(unit.tasks||[]).map(t=>t.id===taskId?{...t,...updates}:t)});
  }

  const selSt = {padding:"6px 10px",border:"1px solid #e8e0cd",borderRadius:6,fontSize:12,background:"#fff",color:"#1a1a1a",fontFamily:"inherit"};

  return (
    <div style={{padding:"16px 20px",maxWidth:1200,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontSize:20,fontWeight:800,color:"#1a1a1a"}}>📋 Kanban — Visão Geral</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select value={filterUnit} onChange={e=>setFilterUnit(e.target.value)} style={selSt}>
            <option value="all">Todas as unidades</option>
            {units.map(u=><option key={u.id} value={String(u.id)}>{u.name}</option>)}
          </select>
          <select value={filterResp} onChange={e=>setFilterResp(e.target.value)} style={selSt}>
            <option value="all">Todos responsáveis</option>
            <option value="Ivanise">Ivanise</option>
            <option value="Will">Will</option>
            <option value="Franqueado">Franqueado</option>
          </select>
        </div>
      </div>

      {/* Status cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          {label:"A Fazer",    count:byCol.fazer,     color:"#ef4444", icon:"📌"},
          {label:"Em Andamento",count:byCol.andamento,color:"#6e81bf", icon:"⚡"},
          {label:"Concluído",  count:byCol.concluido, color:"#2db870", icon:"✅"},
        ].map(m=>(
          <div key={m.label} style={{background:"#fff",border:"1px solid #e8e0cd",borderRadius:10,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:"#8a7e6e",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:32,fontWeight:900,color:m.color,lineHeight:1}}>{m.count}</div>
            </div>
            <div style={{width:48,height:48,borderRadius:24,background:`${m.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{m.icon}</div>
          </div>
        ))}
      </div>

      {/* Per-user dashboard */}
      {filterResp==="all"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
          {byUser.map(u=>(
            <div key={u.name} style={{background:"#fff",border:"1px solid #e8e0cd",borderRadius:10,padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:15,color:"#1a1a1a"}}>👤 {u.name}</div>
                <div style={{fontSize:11,color:"#8a7e6e"}}>{u.total} tarefas no total</div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {[{l:"A Fazer",c:u.fazer,col:"#ef4444"},{l:"Andamento",c:u.andamento,col:"#6e81bf"},{l:"Concluído",c:u.concluido,col:"#2db870"}].map(s=>(
                  <div key={s.l} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:7,background:`${s.col}10`,border:`1px solid ${s.col}25`}}>
                    <div style={{fontSize:22,fontWeight:900,color:s.col}}>{s.c}</div>
                    <div style={{fontSize:9,color:"#8a7e6e",marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {u.total>0&&(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8a7e6e",marginBottom:3}}>
                    <span>Progresso</span>
                    <span>{Math.round(u.concluido/u.total*100)}% concluído</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:"#f0e8d8",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${Math.round(u.concluido/u.total*100)}%`,background:"#2db870",borderRadius:3,transition:"width 0.4s"}} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Kanban board */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,alignItems:"start"}}>
        {KANBAN_COLS.map(col=>{
          const colTasks = filtered.filter(t=>col.statuses.includes(t.status));
          return (
            <div key={col.id} style={{background:"#faf6ef",border:`1.5px solid ${col.color}30`,borderTop:`3px solid ${col.color}`,borderRadius:10,padding:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:10,height:10,borderRadius:5,background:col.color}} />
                <span style={{fontWeight:700,fontSize:13,color:"#1a1a1a"}}>{col.label}</span>
                <span style={{fontSize:12,color:"#8a7e6e",marginLeft:"auto",background:"#fff",padding:"1px 8px",borderRadius:12,border:"1px solid #e8e0cd"}}>{colTasks.length}</span>
              </div>
              {colTasks.length===0&&(
                <div style={{textAlign:"center",padding:"28px 0",color:"#8a7e6e",fontSize:12}}>Nenhuma tarefa</div>
              )}
              {colTasks.map(task=>(
                <KanbanCard key={task.id} task={task} unitName={filterUnit==="all"?task.unitName:null}
                  onMove={(tid,dir)=>moveTask(tid,task.unitId,dir)}
                  onEdit={(tid,upd)=>editTask(tid,task.unitId,upd)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
