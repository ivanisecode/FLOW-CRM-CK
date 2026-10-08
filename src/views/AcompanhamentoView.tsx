import { useState, useMemo, useEffect } from "react";
import { GroupBadge, ProgressBar, Semaphore } from "../components/shared";
import { C, TODAY } from "../lib/constants";
import { GROUP_CFG, STATUS_TASK, daysSince, fmtBRL, fmtDate, genUUID } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";

// ─── MAIN PANEL ───────────────────────────────────────────────
// ─── ACOMPANHAMENTO 360° ─────────────────────────────────────
const CANAIS_CONTATO = ["WhatsApp","Instagram","Reunião (Meet)","Ligação","Visita","Email"];
const CANAL_ICON = { "WhatsApp":"💬","Instagram":"📸","Reunião (Meet)":"🎥","Ligação":"📞","Visita":"🏠","Email":"✉️","Agendamento":"📅","Grupo WhatsApp":"💬" };


function IndCard({ label, value, sub, color, bar }) {
  return (
    <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"12px 14px"}}>
      <div style={{fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>{label}</div>
      <div style={{fontSize:19,fontWeight:800,color:color||C.textPrimary,lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:C.textMuted,marginTop:4}}>{sub}</div>}
      {bar!=null&&(
        <div style={{marginTop:6}}>
          <ProgressBar pct={Math.min(bar,100)} color={bar>=80?C.verde:bar>=50?C.amarelo:C.red} height={5} />
        </div>
      )}
    </div>
  );
}

function TaskFullRow({ task, onUpdate }) {
  const sc = STATUS_TASK[task.status] || STATUS_TASK["nao_iniciado"];
  const [editObs, setEditObs] = useState(false);
  const [obs, setObs] = useState(task.observacao||"");
  const isOverdue = task.status!=="concluido" && task.status!=="cancelado" && task.dataFim && daysSince(task.dataFim)>0;
  return (
    <div style={{background:C.card,border:`1px solid ${isOverdue?C.red+"66":C.cardBorder}`,borderRadius:10,padding:"10px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:180}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,textDecoration:task.status==="concluido"?"line-through":"none",opacity:task.status==="concluido"?0.6:1}}>{task.titulo}</div>
          <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap",fontSize:9,color:C.textMuted}}>
            <span>👤 {task.responsavel}</span>
            <span style={{color:task.prioridade==="Alta"?C.red:task.prioridade==="Média"?C.amareloTxt:C.textMuted,fontWeight:700}}>● {task.prioridade}</span>
            {(task.dataInicio||task.meetingData)&&<span>▶ Início {fmtDate(task.dataInicio||task.meetingData)}</span>}
            {task.dataFim&&<span style={{color:isOverdue?C.red:C.textMuted,fontWeight:isOverdue?700:400}}>⏹ Fim {fmtDate(task.dataFim)}{isOverdue?" ⚠️ vencida":""}</span>}
          </div>
        </div>
        <select value={task.status} onChange={e=>onUpdate(task.id,{status:e.target.value,...(e.target.value==="concluido"&&!task.dataFim?{dataFim:TODAY.toISOString().slice(0,10)}:{})})}
          style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:10,fontWeight:700,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontFamily:"inherit"}}>
          {Object.entries(STATUS_TASK).map(([k,v])=><option key={k} value={k}>{v.dot} {v.label}</option>)}
        </select>
      </div>
      <div style={{marginTop:6}}>
        {editObs?(
          <div style={{display:"flex",gap:6}}>
            <input value={obs} onChange={e=>setObs(e.target.value)} placeholder="Andamento / pendência..." style={{...inputSt,fontSize:11,padding:"5px 8px"}} autoFocus />
            <button onClick={()=>{onUpdate(task.id,{observacao:obs});setEditObs(false);}} style={{...btnSt(C.verde),fontSize:10,padding:"5px 10px"}}>✓</button>
          </div>
        ):(
          <div onClick={()=>setEditObs(true)} style={{fontSize:10,color:task.observacao?C.textPrimary:C.textMuted,cursor:"pointer",background:C.inset,borderRadius:6,padding:"5px 8px",border:`1px dashed ${C.cardBorder}`}}>
            {task.observacao||"+ adicionar andamento / pendência"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DIAGNÓSTICO: INSTAGRAM & ATENDIMENTO ────────────────────
const FREQ_OPTS = [
  ["diario","Diário","#2db870"],["frequente","Frequente","#7a9a1a"],
  ["raro","Raro","#c46c0a"],["inativo","Inativo","#e03535"],
];
const PADRAO_OPTS = [
  ["sim","✅ No padrão","#2db870"],["parcial","🟡 Parcial","#c46c0a"],["nao","❌ Fora do padrão","#e03535"],
];
const ADESAO_OPTS = [
  ["sempre","Sempre","#2db870"],["as_vezes","Às vezes","#7a9a1a"],
  ["raramente","Raramente","#c46c0a"],["nunca","Nunca","#e03535"],
];
const RESPOSTA_OPTS = [
  ["imediato","Imediato","#2db870"],["ate_1h","Até 1h","#7a9a1a"],
  ["ate_24h","Até 24h","#c46c0a"],["mais_24h","+24h","#e03535"],
];
const QUALIDADE_OPTS = [
  ["otimo","Ótimo","#2db870"],["bom","Bom","#7a9a1a"],
  ["regular","Regular","#c46c0a"],["ruim","Ruim","#e03535"],
];
const SCORE_MAP = {
  diario:100,frequente:70,raro:35,inativo:0,
  sim:100,parcial:50,nao:0,
  sempre:100,as_vezes:70,raramente:35,nunca:0,
  imediato:100,ate_1h:70,ate_24h:35,mais_24h:0,
  otimo:100,bom:70,regular:35,ruim:0,
};

function RatePills({ value, onChange, opts }) {
  return (
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {opts.map(([k,label,color])=>{
        const sel = value===k;
        return (
          <button key={k} onClick={()=>onChange(sel?null:k)} style={{
            fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
            background: sel?color:C.inset, color: sel?"#fff":C.textMuted,
            border:`1px solid ${sel?color:C.cardBorder}`,
          }}>{label}</button>
        );
      })}
    </div>
  );
}

function DiagRow({ label, children }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.insetBorder}`,flexWrap:"wrap"}}>
      <span style={{fontSize:11,fontWeight:600,color:C.textPrimary,minWidth:110}}>{label}</span>
      {children}
    </div>
  );
}

function MiniTaskAdder({ placeholder, onAdd }) {
  const [open,setOpen]=useState(false);
  const [titulo,setTitulo]=useState("");
  if(!open) return <button onClick={()=>setOpen(true)} style={{fontSize:10,fontWeight:700,padding:"5px 10px",borderRadius:8,cursor:"pointer",fontFamily:"inherit",background:"#fff3e6",color:C.laranja,border:`1px dashed ${C.laranja}`}}>+ Gerar tarefa desta área</button>;
  return (
    <div style={{display:"flex",gap:6,width:"100%"}}>
      <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder={placeholder} style={{...inputSt,fontSize:11,padding:"6px 9px"}} autoFocus
        onKeyDown={e=>{if(e.key==="Enter"&&titulo.trim()){onAdd(titulo);setTitulo("");setOpen(false);}}} />
      <button onClick={()=>{if(titulo.trim()){onAdd(titulo);setTitulo("");setOpen(false);}}} style={{...btnSt(C.laranja),fontSize:10,padding:"6px 12px"}}>✓</button>
      <button onClick={()=>setOpen(false)} style={{...btnSt("transparent",C.textMuted),fontSize:10,padding:"6px 8px"}}>×</button>
    </div>
  );
}

const DIAG_DEFAULT = {
  instagram_handle:"", ig_stories:null, ig_feed:null, ig_reels:null,
  ig_padrao:null, ig_adesao:null, ig_obs:"",
  atend_conversao:"", atend_leads_mes:"", atend_trafego:null,
  atend_trafego_valor:"", atend_resposta:null, atend_qualidade:null, atend_obs:"",
};

function diagScore(d, keys) {
  const vals = keys.map(k=>SCORE_MAP[d[k]]).filter(v=>v!==undefined);
  if(vals.length===0) return null;
  return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
}

function ScoreBadge({ score }) {
  if(score===null) return <span style={{fontSize:9,color:C.textMuted}}>sem avaliação</span>;
  const color = score>=75?"#2db870":score>=45?"#c46c0a":"#e03535";
  return (
    <span style={{fontSize:11,fontWeight:800,padding:"3px 10px",borderRadius:20,background:`${color}22`,color,border:`1px solid ${color}66`}}>
      {score}/100
    </span>
  );
}

function DiagnosticoSection({ unit, onAddTask }) {
  const [diag, setDiag] = useState(DIAG_DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(()=>{
    let alive = true;
    (async()=>{
      try {
        const rows = await sb.get("unit_diagnostico", `?unit_id=eq.${unit.id}&limit=1`);
        if(alive&&rows&&rows[0]) setDiag({...DIAG_DEFAULT,...rows[0]});
      } catch { /* tabela pode não existir ainda */ }
      if(alive) setLoaded(true);
    })();
    return ()=>{ alive=false; };
  },[unit.id]);

  function upd(updates){ setDiag(d=>({...d,...updates})); setDirty(true); }

  async function save(){
    setSaving(true);
    try {
      await sb.upsert("unit_diagnostico", {
        unit_id: unit.id,
        instagram_handle: diag.instagram_handle||"",
        ig_stories: diag.ig_stories, ig_feed: diag.ig_feed, ig_reels: diag.ig_reels,
        ig_padrao: diag.ig_padrao, ig_adesao: diag.ig_adesao, ig_obs: diag.ig_obs||"",
        atend_conversao: diag.atend_conversao===""?null:Number(diag.atend_conversao),
        atend_leads_mes: diag.atend_leads_mes===""?null:Number(diag.atend_leads_mes),
        atend_trafego: diag.atend_trafego,
        atend_trafego_valor: diag.atend_trafego_valor===""?null:Number(diag.atend_trafego_valor),
        atend_resposta: diag.atend_resposta, atend_qualidade: diag.atend_qualidade,
        atend_obs: diag.atend_obs||"",
        updated_at: new Date().toISOString(),
      }, "unit_id");
      setDirty(false); setSavedAt(new Date());
    } catch(e){ alert("Erro ao salvar diagnóstico. Rode a migração SQL no Supabase.\n\n"+e.message); }
    setSaving(false);
  }

  const igScore = diagScore(diag,["ig_stories","ig_feed","ig_reels","ig_padrao","ig_adesao"]);
  const atScore = diagScore(diag,["atend_resposta","atend_qualidade"]);
  const igHandle = (diag.instagram_handle||"").replace("@","").trim();

  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"0 0 8px 2px",flexWrap:"wrap",gap:6}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>🩺 Diagnóstico da unidade</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {savedAt&&!dirty&&<span style={{fontSize:9,color:"#2a7a52"}}>✓ salvo</span>}
          <button onClick={save} disabled={saving||!loaded} style={{
            ...btnSt(dirty?C.laranja:C.inset, dirty?"#fff":C.textMuted),
            fontSize:11,border:`1px solid ${dirty?C.laranja:C.cardBorder}`,
            opacity:saving?0.6:1,
          }}>{saving?"Salvando...":"💾 Salvar diagnóstico"}</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:10,marginBottom:16}}>

        {/* ── Instagram & Conteúdo ── */}
        <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:800,color:C.textPrimary}}>📸 Instagram & Conteúdo</div>
            <ScoreBadge score={igScore} />
          </div>

          <div style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
            <input value={diag.instagram_handle||""} onChange={e=>upd({instagram_handle:e.target.value})}
              placeholder="@perfil_da_unidade" style={{...inputSt,fontSize:12}} />
            {igHandle&&(
              <a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer"
                style={{...btnSt("#fbeaf0","#c25a82"),fontSize:10,textDecoration:"none",border:"1px solid #f0c0d0",flexShrink:0}}>Abrir ↗</a>
            )}
          </div>

          <DiagRow label="Stories"><RatePills value={diag.ig_stories} onChange={v=>upd({ig_stories:v})} opts={FREQ_OPTS} /></DiagRow>
          <DiagRow label="Feed"><RatePills value={diag.ig_feed} onChange={v=>upd({ig_feed:v})} opts={FREQ_OPTS} /></DiagRow>
          <DiagRow label="Reels"><RatePills value={diag.ig_reels} onChange={v=>upd({ig_reels:v})} opts={FREQ_OPTS} /></DiagRow>
          <DiagRow label="Perfil no padrão CK"><RatePills value={diag.ig_padrao} onChange={v=>upd({ig_padrao:v})} opts={PADRAO_OPTS} /></DiagRow>
          <DiagRow label="Adesão a campanhas"><RatePills value={diag.ig_adesao} onChange={v=>upd({ig_adesao:v})} opts={ADESAO_OPTS} /></DiagRow>

          <label style={{...labelSt,marginTop:10}}>Observações</label>
          <textarea value={diag.ig_obs||""} onChange={e=>upd({ig_obs:e.target.value})}
            placeholder="Ex: feed desatualizado desde abril, não usou arte da campanha São João..."
            style={{...inputSt,height:54,resize:"vertical",marginBottom:8}} />
          <MiniTaskAdder placeholder="Ex: Atualizar destaque de campanhas no IG..." onAdd={t=>onAddTask(`[Instagram] ${t}`)} />
        </div>

        {/* ── Atendimento & Comercial ── */}
        <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:800,color:C.textPrimary}}>🛎 Atendimento & Comercial</div>
            <ScoreBadge score={atScore} />
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
            <div>
              <label style={labelSt}>Taxa de conversão (%)</label>
              <input type="number" min="0" max="100" value={diag.atend_conversao??""} onChange={e=>upd({atend_conversao:e.target.value})}
                placeholder="Ex: 25" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Leads / mês</label>
              <input type="number" min="0" value={diag.atend_leads_mes??""} onChange={e=>upd({atend_leads_mes:e.target.value})}
                placeholder="Ex: 40" style={inputSt} />
            </div>
          </div>
          {diag.atend_conversao!==""&&diag.atend_conversao!=null&&diag.atend_leads_mes!==""&&diag.atend_leads_mes!=null&&(
            <div style={{fontSize:10,color:C.textMuted,marginBottom:6,padding:"5px 9px",background:C.inset,borderRadius:6}}>
              ≈ <b style={{color:C.verde}}>{Math.round(Number(diag.atend_leads_mes)*Number(diag.atend_conversao)/100)}</b> vendas/mês estimadas
            </div>
          )}

          <DiagRow label="Tráfego pago">
            <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
              <RatePills value={diag.atend_trafego===true?"sim":diag.atend_trafego===false?"nao":null}
                onChange={v=>upd({atend_trafego:v==="sim"?true:v==="nao"?false:null})}
                opts={[["sim","✅ Faz","#2db870"],["nao","❌ Não faz","#e03535"]]} />
              {diag.atend_trafego===true&&(
                <input type="number" min="0" value={diag.atend_trafego_valor??""} onChange={e=>upd({atend_trafego_valor:e.target.value})}
                  placeholder="R$/mês" style={{...inputSt,width:90,fontSize:11,padding:"5px 8px"}} />
              )}
            </div>
          </DiagRow>
          <DiagRow label="Tempo de resposta"><RatePills value={diag.atend_resposta} onChange={v=>upd({atend_resposta:v})} opts={RESPOSTA_OPTS} /></DiagRow>
          <DiagRow label="Qualidade do atendimento"><RatePills value={diag.atend_qualidade} onChange={v=>upd({atend_qualidade:v})} opts={QUALIDADE_OPTS} /></DiagRow>

          <label style={{...labelSt,marginTop:10}}>Observações</label>
          <textarea value={diag.atend_obs||""} onChange={e=>upd({atend_obs:e.target.value})}
            placeholder="Ex: demora a responder leads de fim de semana, script de venda desatualizado..."
            style={{...inputSt,height:54,resize:"vertical",marginBottom:8}} />
          <MiniTaskAdder placeholder="Ex: Treinar resposta rápida no WhatsApp..." onAdd={t=>onAddTask(`[Atendimento] ${t}`)} />
        </div>
      </div>
    </>
  );
}

export function AcompanhamentoView({ units, onUpdateUnit }) {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [showAgendar, setShowAgendar] = useState(false);
  const [taskFilter, setTaskFilter] = useState("abertas");
  const [contact, setContact] = useState({
    date: TODAY.toISOString().slice(0,10), tipo:"WhatsApp", responsavel:"Ivanise",
    resumo:"", docLink:"", gerouTarefa:false,
    tTitulo:"", tResp:"Ivanise", tPrio:"Alta",
    tInicio: TODAY.toISOString().slice(0,10), tFim:"",
  });
  const [agenda, setAgenda] = useState({ date:"", tipo:"Reunião (Meet)", responsavel:"Ivanise", resumo:"" });

  const unit = units.find(u=>u.id===selectedId);
  const todayStr = TODAY.toISOString().slice(0,10);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    if(!q) return units;
    return units.filter(u=>u.name.toLowerCase().includes(q));
  },[units,search]);

  // Derivados da unidade selecionada
  const contacts = useMemo(()=>(unit?.contacts||[]).slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")),[unit]);
  const realizadas = contacts.filter(c=>c.date<=todayStr);
  const agendadas = contacts.filter(c=>c.date>todayStr);
  const reunioesFeitas = realizadas.filter(c=>(c.tipo||"").includes("Reunião")||(c.tipo||"").includes("Meet")||(c.tipo||"").includes("Visita"));
  const lastC = realizadas[0];
  const daysAgo = lastC?daysSince(lastC.date):null;
  const freq = unit?GROUP_CFG[unit.group]?.freq||10:10;
  const freqLabel = unit?GROUP_CFG[unit.group]?.freqLabel||"":"";
  const atrasada = daysAgo===null||daysAgo>=freq;
  const proxPrevista = lastC?new Date(new Date(lastC.date).getTime()+freq*86400000):null;

  const tasks = unit?.tasks||[];
  const tasksFiltered = taskFilter==="abertas"
    ? tasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado")
    : taskFilter==="concluidas"
    ? tasks.filter(t=>t.status==="concluido")
    : tasks;

  function updateTask(taskId, updates) {
    onUpdateUnit({ ...unit, tasks: tasks.map(t=>t.id===taskId?{...t,...updates}:t) });
  }

  function addQuickTask(titulo) {
    onUpdateUnit({ ...unit, tasks:[...tasks, {
      id:`manual_${Date.now()}`, meetingId:null, meetingData:todayStr,
      titulo, responsavel: unit.responsible||"Ivanise", prioridade:"Média",
      status:"nao_iniciado", observacao:"", dataInicio:todayStr, dataFim:null,
    }]});
  }

  function saveContact() {
    if(!contact.resumo.trim()) return;
    const newC = {
      id: genUUID(), date: contact.date, tipo: contact.tipo,
      responsavel: contact.responsavel, franqueado: unit.franchiseeName||"",
      resumo: contact.resumo, docLink: contact.docLink, gravacaoLink:"", isRede:false,
    };
    let newTasks = tasks;
    if(contact.gerouTarefa && contact.tTitulo.trim()){
      newTasks = [...tasks, {
        id:`manual_${Date.now()}`, meetingId:null, meetingData:contact.tInicio,
        titulo: contact.tTitulo, responsavel: contact.tResp, prioridade: contact.tPrio,
        status:"nao_iniciado", observacao:`Origem: contato ${contact.tipo} de ${fmtDate(contact.date)}`,
        dataInicio: contact.tInicio, dataFim: contact.tFim||null,
      }];
    }
    onUpdateUnit({
      ...unit,
      contacts:[newC,...contacts],
      tasks:newTasks,
      lastContactDate: contact.date<=todayStr?contact.date:unit.lastContactDate,
      lastContactType: contact.tipo,
    });
    setContact({date:todayStr,tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gerouTarefa:false,tTitulo:"",tResp:"Ivanise",tPrio:"Alta",tInicio:todayStr,tFim:""});
    setShowContact(false);
  }

  function saveAgendamento() {
    if(!agenda.date||agenda.date<=todayStr) return;
    const newC = {
      id: genUUID(), date: agenda.date, tipo: agenda.tipo,
      responsavel: agenda.responsavel, franqueado: unit.franchiseeName||"",
      resumo: agenda.resumo||"Reunião agendada com a supervisão", docLink:"", gravacaoLink:"", isRede:false,
    };
    onUpdateUnit({ ...unit, contacts:[newC,...contacts] });
    setAgenda({date:"",tipo:"Reunião (Meet)",responsavel:"Ivanise",resumo:""});
    setShowAgendar(false);
  }

  return (
    <div style={{padding:"14px",maxWidth:980,margin:"0 auto"}}>
      {/* ── Seletor de unidade ── */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"14px 16px",marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:800,color:C.textPrimary,marginBottom:8}}>🎯 Acompanhamento por unidade</div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar unidade... (ex: Recife, Toledo)" style={{...inputSt,marginBottom:8}} />
        <div style={{display:"flex",gap:6,flexWrap:"wrap",maxHeight:120,overflowY:"auto"}}>
          {filtered.slice(0,40).map(u=>{
            const sel = u.id===selectedId;
            const gc = GROUP_CFG[u.group];
            return (
              <button key={u.id} onClick={()=>setSelectedId(u.id)} style={{
                fontSize:10,fontWeight:sel?800:600,padding:"5px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
                background: sel?C.laranja:gc?.bg||C.inset,
                color: sel?"#fff":gc?.color||C.textPrimary,
                border:`1px solid ${sel?C.laranja:C.cardBorder}`,
              }}>{u.name}</button>
            );
          })}
          {filtered.length>40&&<span style={{fontSize:10,color:C.textMuted,alignSelf:"center"}}>+{filtered.length-40} — refine a busca</span>}
        </div>
      </div>

      {!unit&&(
        <div style={{textAlign:"center",padding:"50px 20px",color:C.textMuted}}>
          <div style={{fontSize:40,marginBottom:8}}>🧩</div>
          <div style={{fontSize:14,fontWeight:700}}>Selecione uma unidade acima</div>
          <div style={{fontSize:11,marginTop:4}}>Visão completa: indicadores, reuniões, contatos e tarefas</div>
        </div>
      )}

      {unit&&(
        <>
          {/* ── Cabeçalho da unidade ── */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
            <div style={{height:6,background:"linear-gradient(90deg,#f19134 0%,#f9d856 100%)"}} />
            <div style={{padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                    <GroupBadge group={unit.group} />
                    <Semaphore unit={unit} />
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:atrasada?C.redBg:"#e8f5ee",color:atrasada?C.red:"#1a7a45"}}>
                      {atrasada?`⚠️ Contato atrasado (${daysAgo===null?"nunca":daysAgo+"d"})`:`✓ Em dia (${daysAgo}d)`}
                    </span>
                  </div>
                  <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>{unit.name}</div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>
                    🎂 Inaugurou <b style={{color:C.textPrimary}}>{fmtDate(unit.inaug)}</b> · {unit.monthsActive} meses · {unit.daysActive} dias de rede
                    {unit.franchiseeName&&<> · 👤 {unit.franchiseeName}</>}
                  </div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>
                    📋 Frequência do grupo: <b style={{color:C.textPrimary}}>{freqLabel}</b> (a cada {freq} dias) · Responsável: <b style={{color:unit.responsible==="Will"?C.azul:C.laranja}}>{unit.responsible}</b>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {unit.whatsapp&&(
                    <a href={`https://wa.me/55${unit.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                      style={{...btnSt("#e8f5ee","#1a7a45"),border:"1px solid #b0ddc3",textDecoration:"none",fontSize:11}}>💬 WhatsApp</a>
                  )}
                  <button onClick={()=>{setShowContact(!showContact);setShowAgendar(false);}} style={{...btnSt(C.laranja),fontSize:11}}>+ Registrar contato</button>
                  <button onClick={()=>{setShowAgendar(!showAgendar);setShowContact(false);}} style={{...btnSt(C.inset,C.textPrimary),border:`1px solid ${C.cardBorder}`,fontSize:11}}>📅 Agendar reunião</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Form: Registrar contato ── */}
          {showContact&&(
            <div style={{background:C.card,border:`1.5px solid ${C.laranja}`,borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:800,color:C.textPrimary,marginBottom:10}}>📝 Registrar contato — {unit.name}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
                <div><label style={labelSt}>Data</label><input type="date" value={contact.date} onChange={e=>setContact({...contact,date:e.target.value})} style={inputSt} /></div>
                <div><label style={labelSt}>Canal</label>
                  <select value={contact.tipo} onChange={e=>setContact({...contact,tipo:e.target.value})} style={inputSt}>
                    {CANAIS_CONTATO.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelSt}>Quem fez</label>
                  <select value={contact.responsavel} onChange={e=>setContact({...contact,responsavel:e.target.value})} style={inputSt}>
                    <option>Ivanise</option><option>Will</option>
                  </select>
                </div>
              </div>
              <label style={labelSt}>O que foi tratado</label>
              <textarea value={contact.resumo} onChange={e=>setContact({...contact,resumo:e.target.value})}
                placeholder="Resumo do contato: assuntos, combinados, próximos passos..." style={{...inputSt,height:70,resize:"vertical",marginBottom:8}} />
              <input value={contact.docLink} onChange={e=>setContact({...contact,docLink:e.target.value})} placeholder="🔗 Link da ata (opcional)" style={{...inputSt,marginBottom:10}} />

              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:contact.gerouTarefa?10:0,
                background:contact.gerouTarefa?"#fff3e6":C.inset,border:`1px solid ${contact.gerouTarefa?C.laranja:C.cardBorder}`,borderRadius:8,padding:"8px 12px"}}>
                <input type="checkbox" checked={contact.gerouTarefa} onChange={e=>setContact({...contact,gerouTarefa:e.target.checked})} style={{accentColor:C.laranja,width:16,height:16}} />
                <span style={{fontSize:12,fontWeight:700,color:contact.gerouTarefa?C.laranja:C.textPrimary}}>✅ Este contato gerou tarefa</span>
              </label>

              {contact.gerouTarefa&&(
                <div style={{background:C.inset,borderRadius:10,padding:"12px",marginBottom:10,border:`1px dashed ${C.laranja}88`}}>
                  <input value={contact.tTitulo} onChange={e=>setContact({...contact,tTitulo:e.target.value})} placeholder="Título da tarefa..." style={{...inputSt,marginBottom:8,background:C.card}} />
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
                    <div><label style={labelSt}>Responsável</label>
                      <select value={contact.tResp} onChange={e=>setContact({...contact,tResp:e.target.value})} style={{...inputSt,background:C.card}}>
                        <option>Ivanise</option><option>Will</option><option>Franqueado</option><option>Artur</option>
                      </select>
                    </div>
                    <div><label style={labelSt}>Prioridade</label>
                      <select value={contact.tPrio} onChange={e=>setContact({...contact,tPrio:e.target.value})} style={{...inputSt,background:C.card}}>
                        <option>Alta</option><option>Média</option><option>Baixa</option>
                      </select>
                    </div>
                    <div><label style={labelSt}>Data início</label><input type="date" value={contact.tInicio} onChange={e=>setContact({...contact,tInicio:e.target.value})} style={{...inputSt,background:C.card}} /></div>
                    <div><label style={labelSt}>Prazo (fim)</label><input type="date" value={contact.tFim} onChange={e=>setContact({...contact,tFim:e.target.value})} style={{...inputSt,background:C.card}} /></div>
                  </div>
                </div>
              )}

              <div style={{display:"flex",gap:8}}>
                <button onClick={saveContact} style={btnSt(C.laranja)}>💾 Salvar contato{contact.gerouTarefa?" + tarefa":""}</button>
                <button onClick={()=>setShowContact(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
              </div>
            </div>
          )}

          {/* ── Form: Agendar reunião ── */}
          {showAgendar&&(
            <div style={{background:C.card,border:`1.5px solid ${C.azul}`,borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:800,color:C.textPrimary,marginBottom:10}}>📅 Agendar reunião — {unit.name}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
                <div><label style={labelSt}>Data prevista</label><input type="date" min={todayStr} value={agenda.date} onChange={e=>setAgenda({...agenda,date:e.target.value})} style={inputSt} /></div>
                <div><label style={labelSt}>Canal</label>
                  <select value={agenda.tipo} onChange={e=>setAgenda({...agenda,tipo:e.target.value})} style={inputSt}>
                    {CANAIS_CONTATO.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelSt}>Responsável</label>
                  <select value={agenda.responsavel} onChange={e=>setAgenda({...agenda,responsavel:e.target.value})} style={inputSt}>
                    <option>Ivanise</option><option>Will</option>
                  </select>
                </div>
              </div>
              <input value={agenda.resumo} onChange={e=>setAgenda({...agenda,resumo:e.target.value})} placeholder="Pauta prevista (opcional)" style={{...inputSt,marginBottom:10}} />
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveAgendamento} style={btnSt(C.azul)}>📅 Agendar</button>
                <button onClick={()=>setShowAgendar(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
              </div>
            </div>
          )}

          {/* ── Indicadores ── */}
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px 2px"}}>📊 Indicadores</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
            <IndCard label="Fat. Março/26" value={fmtBRL(unit.fatMar)} />
            <IndCard label="Fat. Abril/26" value={fmtBRL(unit.fatAbr)} sub={unit.fatMar>0?`${unit.fatAbr>=unit.fatMar?"↑":"↓"} ${Math.abs(Math.round(((unit.fatAbr-unit.fatMar)/unit.fatMar)*100))}% vs mar`:null} color={unit.fatAbr>=unit.fatMar?C.verde:C.red} />
            <IndCard label="Fat. Maio/26" value={fmtBRL(unit.fatMai)} sub={unit.fatAbr>0?`${unit.fatMai>=unit.fatAbr?"↑":"↓"} ${Math.abs(Math.round(((unit.fatMai-unit.fatAbr)/unit.fatAbr)*100))}% vs abr`:null} color={unit.fatMai>=unit.fatAbr?C.verde:C.red} />
            <IndCard label="Média trimestre" value={fmtBRL(Math.round(unit.avgTri))} />
            <IndCard label="Meta Junho/26" value={fmtBRL(unit.metaJun)} sub={`Atingimento maio: ${unit.metaProgress}%`} color={C.laranja} bar={unit.metaProgress} />
            <IndCard label="ROI acumulado" value={`${unit.roiAccum}%`} sub={`Investimento ${fmtBRL(unit.investment)}`} color={unit.roiAccum>=100?C.verde:C.laranja} bar={Math.min(unit.roiAccum,100)} />
            <IndCard label="Payback restante" value={unit.paybackLeft===null?"—":unit.paybackLeft===0?"✓ Pago":`${unit.paybackLeft} meses`} color={unit.paybackLeft===0?C.verde:C.textPrimary} />
            {unit.group==="BERÇÁRIO"&&<IndCard label="Berçário" value={`${unit.daysInBercario}d restantes`} sub={unit.isRepasse?"Repasse":"Meta R$3.000 em 120d"} color={C.bercario} />}
          </div>

          {/* ── Diagnóstico: Instagram + Atendimento ── */}
          <DiagnosticoSection key={unit.id} unit={unit} onAddTask={addQuickTask} />

          {/* ── Reuniões ── */}
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px 2px"}}>🗓 Reuniões com a supervisão</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:16}}>
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>✅ Realizadas</div>
              <div style={{fontSize:22,fontWeight:800,color:C.verde}}>{reunioesFeitas.length}</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>{lastC?`Última: ${fmtDate(lastC.date)} (${CANAL_ICON[lastC.tipo]||"•"} ${lastC.tipo})`:"Nenhum contato registrado"}</div>
            </div>
            <div style={{background:C.card,border:`1px solid ${agendadas.length>0?C.azul+"66":C.cardBorder}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>📅 A realizar (agendadas)</div>
              <div style={{fontSize:22,fontWeight:800,color:C.azul}}>{agendadas.length}</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>
                {agendadas.length>0?`Próxima: ${fmtDate(agendadas[agendadas.length-1].date)} (${agendadas[agendadas.length-1].responsavel})`:proxPrevista?`Sugerida até ${fmtDate(proxPrevista.toISOString().slice(0,10))}`:"Agende a primeira"}
              </div>
            </div>
            <div style={{background:atrasada?C.redBg:C.card,border:`1px solid ${atrasada?C.red+"88":C.cardBorder}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,fontWeight:700,color:atrasada?C.red:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>{atrasada?"⚠️ Em atraso":"✓ Em dia"}</div>
              <div style={{fontSize:22,fontWeight:800,color:atrasada?C.red:C.verde}}>{daysAgo===null?"—":`${daysAgo}d`}</div>
              <div style={{fontSize:10,color:atrasada?C.red:C.textMuted,marginTop:3}}>Frequência {freqLabel.toLowerCase()} — limite {freq}d sem contato</div>
            </div>
          </div>

          {/* ── Agendamentos futuros listados ── */}
          {agendadas.length>0&&(
            <div style={{marginBottom:16}}>
              {agendadas.slice().reverse().map(c=>(
                <div key={c.id} style={{background:"#eaeffa",border:`1px solid ${C.azul}55`,borderRadius:10,padding:"9px 13px",marginBottom:6,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:13}}>📅</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#2e4a9e"}}>{fmtDate(c.date)}</span>
                  <span style={{fontSize:11,color:"#2e4a9e"}}>{CANAL_ICON[c.tipo]||"•"} {c.tipo} · {c.responsavel}</span>
                  {c.resumo&&<span style={{fontSize:10,color:C.textMuted}}>— {c.resumo}</span>}
                </div>
              ))}
            </div>
          )}

          {/* ── Tarefas ── */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"0 0 8px 2px",flexWrap:"wrap",gap:6}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>✅ Tarefas ({tasksFiltered.length})</div>
            <div style={{display:"flex",gap:5}}>
              {[["abertas","Abertas"],["concluidas","Concluídas"],["todas","Todas"]].map(([k,l])=>(
                <button key={k} onClick={()=>setTaskFilter(k)} style={{
                  fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
                  background:taskFilter===k?C.laranja:C.inset,color:taskFilter===k?"#fff":C.textMuted,
                  border:`1px solid ${taskFilter===k?C.laranja:C.cardBorder}`,
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {tasksFiltered.length===0&&<div style={{textAlign:"center",padding:"24px",color:C.textMuted,fontSize:12,background:C.card,borderRadius:12,border:`1px dashed ${C.cardBorder}`}}>Nenhuma tarefa {taskFilter==="abertas"?"aberta":taskFilter==="concluidas"?"concluída":""} — registre um contato e marque "gerou tarefa"</div>}
            {tasksFiltered.map(t=><TaskFullRow key={t.id} task={t} onUpdate={updateTask} />)}
          </div>

          {/* ── Timeline de contatos ── */}
          <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px 2px"}}>🕓 Histórico de contatos ({realizadas.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:20}}>
            {realizadas.length===0&&<div style={{textAlign:"center",padding:"24px",color:C.textMuted,fontSize:12,background:C.card,borderRadius:12,border:`1px dashed ${C.cardBorder}`}}>📭 Nenhum contato registrado ainda</div>}
            {realizadas.slice(0,30).map((c,i)=>(
              <div key={c.id} style={{display:"flex",gap:12}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:20,flexShrink:0}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:c.responsavel==="Will"?C.azul:C.laranja,border:`2px solid ${C.card}`,boxShadow:`0 0 0 1.5px ${c.responsavel==="Will"?C.azul:C.laranja}`,marginTop:14}} />
                  {i<Math.min(realizadas.length,30)-1&&<div style={{width:2,flex:1,background:C.cardBorder}} />}
                </div>
                <div style={{flex:1,background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"10px 13px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6,marginBottom:4}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.textPrimary}}>{fmtDate(c.date)}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:"1px 8px",borderRadius:10,background:C.inset,border:`1px solid ${C.cardBorder}`,color:C.textPrimary}}>{CANAL_ICON[c.tipo]||"•"} {c.tipo}</span>
                      <span style={{fontSize:10,fontWeight:700,color:c.responsavel==="Will"?C.azul:C.laranja}}>👤 {c.responsavel}</span>
                      {c.isRede&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:"#f0ebff",color:"#6030b8"}}>REDE</span>}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {c.docLink&&<a href={c.docLink} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.azul,textDecoration:"none",fontWeight:700}}>📄 Ata</a>}
                      {c.gravacaoLink&&<a href={c.gravacaoLink} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.azul,textDecoration:"none",fontWeight:700}}>🎬 Gravação</a>}
                    </div>
                  </div>
                  {c.resumo&&<div style={{fontSize:11,color:C.textPrimary,lineHeight:1.5}}>{c.resumo}</div>}
                  {c.franqueado&&<div style={{fontSize:9,color:C.textMuted,marginTop:4}}>Participantes: {c.franqueado}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
