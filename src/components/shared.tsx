import { C } from "../lib/constants";
import { GROUP_CFG, STATUS_TASK, daysSince, fmtDate } from "../lib/helpers";

// ─── SHARED COMPONENTS ───────────────────────────────────────
export function Semaphore({ unit }) {
  const days = unit.lastContactDate ? daysSince(unit.lastContactDate) : 999;
  const thresh = GROUP_CFG[unit.group]?.freq || 10;
  const status = days >= thresh ? "red" : days >= thresh * 0.7 ? "yellow" : "green";
  const colors = { red: C.red, yellow: C.amarelo, green: C.verde };
  return (
    <span style={{
      display:"inline-block", width:9, height:9, borderRadius:"50%",
      background: colors[status], boxShadow:`0 0 5px ${colors[status]}`, flexShrink:0,
    }} />
  );
}

export function GroupBadge({ group, small }) {
  const cfg = GROUP_CFG[group];
  return (
    <span style={{
      fontSize: small ? 9 : 10, fontWeight:700,
      padding: small ? "1px 5px" : "2px 7px", borderRadius:4,
      background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.color}33`,
      whiteSpace:"nowrap", letterSpacing:"0.03em",
    }}>
      {cfg.label}
    </span>
  );
}

export function ProgressBar({ pct, color, height=4 }) {
  const c = Math.min(pct,100);
  const col = color || (pct>=100?C.verde:pct>=70?C.amarelo:C.red);
  return (
    <div style={{width:"100%",height,borderRadius:2,background:"#ece4d2",overflow:"hidden"}}>
      <div style={{width:`${c}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.4s"}} />
    </div>
  );
}


// ─── TASK ROW ─────────────────────────────────────────────────
export function TaskRow({ task, onUpdate, compact }) {
  const sc = STATUS_TASK[task.status];
  const isOverdue = task.status !== "concluido" && task.meetingData &&
    daysSince(task.meetingData) > 14;
  const prioColor = { Alta: C.red, Média: C.amareloTxt, Baixa: C.textMuted };
  return (
    <div style={{
      display:"flex", alignItems:"flex-start", gap:10,
      padding: compact ? "5px 0" : "10px 14px",
      borderBottom:`1px solid ${C.cardBorder}`,
      background: isOverdue ? "#ef444408" : "transparent",
    }}>
      <select
        value={task.status}
        onChange={e => onUpdate(task.id, { status: e.target.value })}
        style={{
          background:C.inset, border:`1px solid ${C.cardBorder}`,
          color: sc.color, fontSize:10, borderRadius:4, padding:"2px 4px",
          cursor:"pointer", flexShrink:0, marginTop:2,
        }}
      >
        {Object.entries(STATUS_TASK).map(([k,v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
      <div style={{flex:1, minWidth:0}}>
        <div style={{
          fontSize:12, fontWeight:600,
          color: task.status==="concluido" ? C.textMuted : C.textPrimary,
          textDecoration: task.status==="concluido" ? "line-through" : "none",
        }}>
          {task.titulo}
        </div>
        <div style={{display:"flex",gap:10,marginTop:2,flexWrap:"wrap"}}>
          <span style={{fontSize:10,color:prioColor[task.prioridade]}}>● {task.prioridade}</span>
          <span style={{fontSize:10,color:C.textMuted}}>→ {task.responsavel}</span>
          <span style={{fontSize:10,color:C.textMuted}}>Reunião: {fmtDate(task.meetingData)}</span>
          {isOverdue && <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#ef444422",color:C.red}}>VENCIDA</span>}
        </div>
      </div>
    </div>
  );
}
