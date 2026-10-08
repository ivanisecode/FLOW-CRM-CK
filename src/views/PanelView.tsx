import { useState, useMemo } from "react";
import { GroupBadge, ProgressBar, Semaphore } from "../components/shared";
import { C } from "../lib/constants";
import { GROUP_CFG, daysSince, fmtBRL } from "../lib/helpers";
import { inputSt } from "../lib/styles";

export function PanelView({ units, onSelectUnit }) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterContact, setFilterContact] = useState("Todos");
  const [filterCarteira, setFilterCarteira] = useState("Todos");

  const filtered = useMemo(()=>units.filter(u=>{
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.franchiseeName.toLowerCase().includes(search.toLowerCase());
    const mg = filterGroup==="Todos" || u.group===filterGroup;
    const days = u.lastContactDate?daysSince(u.lastContactDate):999;
    const thresh = GROUP_CFG[u.group]?.freq||10;
    const mc = filterContact==="Todos" || (filterContact==="Atrasado"&&days>=thresh) || (filterContact==="Em dia"&&days<thresh);
    const mk = filterCarteira==="Todos" || u.responsible===filterCarteira;
    return ms&&mg&&mc&&mk;
  }),[units,search,filterGroup,filterContact,filterCarteira]);

  return (
    <div style={{padding:"12px 14px"}}>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar unidade..." style={{...inputSt,width:"100%",maxWidth:280}} />
        {["Todos","BERÇÁRIO","G1","G2","G3","G4"].map(g=>(
          <button key={g} onClick={()=>setFilterGroup(g)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterGroup===g?C.laranja:C.cardBorder}`,
            background:filterGroup===g?`${C.laranja}22`:"transparent",
            color:filterGroup===g?C.laranja:C.textMuted,
          }}>{g}</button>
        ))}
        <button onClick={()=>setFilterContact(filterContact==="Atrasado"?"Todos":"Atrasado")} style={{
          padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
          border:`1px solid ${filterContact==="Atrasado"?C.red:C.cardBorder}`,
          background:filterContact==="Atrasado"?`${C.red}22`:"transparent",
          color:filterContact==="Atrasado"?C.red:C.textMuted,
        }}>🔴 Contato atrasado</button>
        {["Todos","Ivanise","Will"].map(k=>(
          <button key={k} onClick={()=>setFilterCarteira(k)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterCarteira===k?C.azul:C.cardBorder}`,
            background:filterCarteira===k?`${C.azul}22`:"transparent",
            color:filterCarteira===k?C.azul:C.textMuted,
          }}>{k==="Todos"?"👥 Todos":k==="Ivanise"?"🟠 Ivanise":"🔵 Will"}</button>
        ))}
      </div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>{filtered.length} de {units.length} unidades</div>

      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={{width:"100%",minWidth:520,borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.cardBorder}`}}>
              {["Unidade","Grupo","Fat. Mai/26","Meta Jun/26","Último contato","Tarefas","Resp."].map(h=>(
                <th key={h} style={{padding:"8px 10px",fontSize:9,color:C.textMuted,textAlign:"left",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>{
              const openT=(u.tasks||[]).filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
              const overdueT=openT.filter(t=>t.meetingData&&daysSince(t.meetingData)>14);
              const daysAgo=u.lastContactDate?daysSince(u.lastContactDate):null;
              return (
                <tr key={u.id} onClick={()=>onSelectUnit(u)}
                  style={{borderBottom:`1px solid ${C.cardBorder}`,cursor:"pointer",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"9px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Semaphore unit={u} />
                      <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{u.name}</span>
                      {u.group==="BERÇÁRIO"&&<span style={{fontSize:9,color:C.bercario}}>({u.daysInBercario}d)</span>}
                    </div>
                  </td>
                  <td style={{padding:"9px 8px"}}><GroupBadge group={u.group} small /></td>
                  <td style={{padding:"9px 8px",textAlign:"right"}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.textPrimary}}>{fmtBRL(u.fatMai)}</span>
                  </td>
                  <td style={{padding:"9px 8px",minWidth:90}}>
                    <div style={{fontSize:9,color:C.textMuted,marginBottom:2,display:"flex",justifyContent:"space-between"}}>
                      <span>{u.metaProgress}%</span><span>{fmtBRL(u.metaJun)}</span>
                    </div>
                    <ProgressBar pct={u.metaProgress} />
                  </td>
                  <td style={{padding:"9px 8px",textAlign:"center"}}>
                    {daysAgo===null?<span style={{fontSize:10,color:C.red}}>Sem contato</span>:
                      <span style={{fontSize:11,color:daysAgo===0?C.verde:C.textMuted}}>{daysAgo===0?"Hoje":`${daysAgo}d`}</span>}
                  </td>
                  <td style={{padding:"9px 8px",textAlign:"center"}}>
                    {openT.length>0?<span style={{fontSize:11,fontWeight:700,color:overdueT.length>0?C.red:C.textMuted}}>{openT.length}{overdueT.length>0?` ⚠️${overdueT.length}`:""}</span>:
                      <span style={{fontSize:11,color:C.cardBorder}}>—</span>}
                  </td>
                  <td style={{padding:"9px 8px"}}>
                    <span style={{fontSize:11,color:C.textMuted}}>{u.responsible}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ─── STATS BAR ───────────────────────────────────────────────
export function StatsBar({ units }) {
  const bercarios=units.filter(u=>u.group==="BERÇÁRIO").length;
  const g1=units.filter(u=>u.group==="G1").length;
  const g2=units.filter(u=>u.group==="G2").length;
  const g3=units.filter(u=>u.group==="G3").length;
  const g4=units.filter(u=>u.group==="G4").length;
  const needContact=units.filter(u=>{
    const d=u.lastContactDate?daysSince(u.lastContactDate):999;
    return d>=(GROUP_CFG[u.group]?.freq||10);
  }).length;
  const allTasks=units.flatMap(u=>u.tasks||[]);
  const openTasks=allTasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado").length;
  const overdueTasks=allTasks.filter(t=>t.status!=="concluido"&&t.meetingData&&daysSince(t.meetingData)>14).length;

  const stats=[
    {label:"Total",value:units.length,color:C.textPrimary},
    {label:"Berçário",value:bercarios,color:C.bercario},
    {label:"G1",value:g1,color:C.laranja},
    {label:"G2",value:g2,color:C.verde},
    {label:"G3",value:g3,color:C.azul},
    {label:"G4",value:g4,color:C.red},
    {label:"S/ contato",value:needContact,color:needContact>10?C.red:C.amareloTxt},
    {label:"Tarefas",value:openTasks,color:overdueTasks>0?C.red:C.textMuted},
  ];

  return (
    <div style={{
      display:"flex", borderBottom:`1px solid ${C.cardBorder}`,
      background:C.card,
      overflowX:"auto", scrollbarWidth:"none", msOverflowStyle:"none",
    }}>
      {stats.map(s=>(
        <div key={s.label} style={{
          padding:"6px 12px", borderRight:`1px solid ${C.cardBorder}`,
          flexShrink:0, minWidth:52, textAlign:"center",
        }}>
          <div style={{fontSize:15,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
          <div style={{fontSize:8,color:C.textMuted,whiteSpace:"nowrap",marginTop:2}}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
