import { useState, useMemo, useEffect } from "react";
import { GroupBadge, ProgressBar, Semaphore, TaskRow } from "../components/shared";
import { C, TODAY } from "../lib/constants";
import { GROUP_CFG, STATUS_TASK, daysSince, fmtBRL, fmtDate, genUUID } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";
import { sb } from "../lib/supabase";
import { UnitKanban } from "./KanbanView";

// ─── UNIT DETAIL PANEL ────────────────────────────────────────
export function UnitDetail({ unit, onClose, onUpdate, allMeetings }) {
  const [tab, setTab] = useState("diagnostico");
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newTask, setNewTask] = useState({ titulo:"",responsavel:"Ivanise",prioridade:"Alta",status:"nao_iniciado",observacao:"" });
  const [newContact, setNewContact] = useState({ date:TODAY.toISOString().slice(0,10),tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gravacaoLink:"" });
  const [localUnit, setLocalUnit] = useState(unit);
  const [contactError, setContactError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [diag, setDiag] = useState({
    diagnostico_texto:"", fat_semana:"", projecao_mes:"", correcao_projetada:"",
    ig_feed_dias:"", ig_reels_dias:"", ig_stories_ativo:false, ig_trafego_pago:false,
    ig_campanhas_ativas:false, ig_participacao_campanhas:false,
    comercial_novos:"", comercial_renovacoes:"", comercial_leads:"",
    comercial_atend_fds:"", comercial_dificuldade:"",
    check_ig_verificado:false, check_wpp_enviado:false,
    check_form_preenchido:false, check_reuniao_realizada:false,
    proxima_reuniao:"", link_meet:"",
  });
  const [diagLoaded, setDiagLoaded] = useState(false);

  useEffect(()=>{
    if(diagLoaded) return;
    sb.get("unit_diagnostico",`?unit_id=eq.${unit.id}&select=*`).then(rows=>{
      if(rows&&rows[0]) setDiag(prev=>({...prev,...rows[0]}));
    }).catch(()=>{}).finally(()=>setDiagLoaded(true));
  },[unit.id, diagLoaded]);

  function saveDiag(updates) {
    const next = {...diag,...updates};
    setDiag(next);
    sb.upsert("unit_diagnostico",{...next,unit_id:unit.id},"unit_id").catch(()=>{});
  }

  const unitMeetings = useMemo(()=>
    (allMeetings||[]).filter(m=>m.unidade===unit.name||(m.extra||[]).includes(unit.name))
      .sort((a,b)=>b.data.localeCompare(a.data))
  ,[allMeetings,unit.name]);

  const cfg = GROUP_CFG[localUnit.group];
  const openTasks = (localUnit.tasks||[]).filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
  const doneTasks = (localUnit.tasks||[]).filter(t=>t.status==="concluido");
  const overdueTasks = openTasks.filter(t=>t.meetingData && daysSince(t.meetingData)>14);
  const lastContact = localUnit.contacts?.sort((a,b)=>b.date.localeCompare(a.date))[0];
  const daysAgo = lastContact ? daysSince(lastContact.date) : null;

  function updateLocal(updates) {
    const updated = {...localUnit,...updates};
    setLocalUnit(updated);
    onUpdate(updated);
  }

  function updateTask(taskId, updates) {
    updateLocal({ tasks: (localUnit.tasks||[]).map(t=>t.id===taskId?{...t,...updates}:t) });
  }

  function addTask() {
    if(!newTask.titulo.trim()) { setTaskError("Preencha o título da tarefa."); return; }
    setTaskError("");
    updateLocal({
      tasks:[...(localUnit.tasks||[]),{
        ...newTask, id: genUUID(),
        meetingId:null, meetingData:TODAY.toISOString().slice(0,10),
      }]
    });
    setNewTask({titulo:"",responsavel:"Ivanise",prioridade:"Alta",status:"nao_iniciado",observacao:""});
    setShowNewTask(false);
  }

  function addContact() {
    if(!newContact.resumo.trim()) { setContactError("Preencha o resumo do contato."); return; }
    setContactError("");
    const newEntry = { ...newContact, id: genUUID() };
    const updated = {
      ...localUnit,
      contacts: [newEntry, ...(localUnit.contacts||[])],
      lastContactDate: newContact.date,
      lastContactType: newContact.tipo,
    };
    setLocalUnit(updated);
    onUpdate(updated);
    setNewContact({date:TODAY.toISOString().slice(0,10),tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gravacaoLink:""});
    setShowNewContact(false);
  }

  const TABS = [
    {id:"diagnostico",label:"Diagnóstico"},
    {id:"tasks",label:`Tarefas (${openTasks.length}${overdueTasks.length>0?` ⚠️${overdueTasks.length}`:""})`},
    {id:"kanban",label:"Kanban"},
    {id:"contacts",label:`Contatos (${(localUnit.contacts||[]).length})`},
    {id:"notes",label:"Notas"},
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"#3a3020aa",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",zIndex:500}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(700px,100vw)",height:"100vh",background:C.card,borderLeft:`1px solid ${C.cardBorder}`,overflowY:"auto",display:"flex",flexDirection:"column",boxShadow:"-8px 0 24px #3a302022"}}>

        {/* Header */}
        <div style={{height:6,background:"linear-gradient(90deg,#f19134 0%,#f9d856 100%)",flexShrink:0}} />
        <div style={{padding:"16px 22px 0",borderBottom:`1px solid ${C.cardBorder}`,position:"sticky",top:0,background:C.card,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                <GroupBadge group={localUnit.group} />
                <Semaphore unit={localUnit} />
                <span style={{fontSize:11,color:daysAgo===null?"#ef4444":C.textMuted}}>
                  {daysAgo===null?"Sem contato registrado":daysAgo===0?"Contato hoje":`${daysAgo}d sem contato`}
                </span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>{localUnit.name}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>
                Inaugurou {fmtDate(localUnit.inaug)} · {localUnit.monthsActive} meses · {localUnit.daysActive} dias de rede
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.textMuted,fontSize:22,cursor:"pointer",padding:4}}>×</button>
          </div>

          {/* Berçário banner */}
          {localUnit.group==="BERÇÁRIO" && (
            <div style={{background:`${C.bercario}15`,border:`1px solid ${C.bercario}44`,borderRadius:8,padding:"8px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>🐣</span>
              <div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.bercario}}>Berçário — {localUnit.daysInBercario} dias restantes</span>
                  {localUnit.isRepasse&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${C.amarelo}22`,color:C.amareloTxt,border:`1px solid ${C.amarelo}88`}}>REPASSE</span>}
                </div>
                <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>
                  {localUnit.isRepasse?`Repasse em ${fmtDate(localUnit.bercStart)}`:`Inaugurou em ${fmtDate(localUnit.inaug)}`} · Meta R$3.000 em 120 dias · Contato diário
                </div>
              </div>
            </div>
          )}

          {/* Quick summary bar */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[
              {label:"Fat. Mai/26",value:fmtBRL(localUnit.fatMai),color:C.textPrimary},
              {label:"Meta Jun/26",value:fmtBRL(localUnit.metaJun),color:C.laranja},
              {label:"Tarefas abertas",value:openTasks.length,color:overdueTasks.length>0?C.red:C.textPrimary},
              {label:"ROI acumulado",value:`${localUnit.roiAccum}%`,color:localUnit.roiAccum>=100?C.verde:C.laranja},
            ].map(s=>(
              <div key={s.label} style={{background:C.inset,border:`1px solid ${C.cardBorder}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:9,color:C.textMuted,marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>{setShowNewContact(true); setTab("contacts");}} style={btnSt(C.laranja)}>+ Registrar contato</button>
            <button onClick={()=>{setShowNewTask(true); setTab("tasks");}} style={{...btnSt(C.inset,C.textPrimary),border:`1px solid ${C.cardBorder}`}}>+ Nova tarefa</button>
            {localUnit.whatsapp&&(
              <a href={`https://wa.me/55${localUnit.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                style={{...btnSt("#25D36622","#25D366"),border:"1px solid #25D36644",textDecoration:"none"}}>
                💬 WhatsApp
              </a>
            )}
          </div>

          {/* Tabs */}
          <div style={{display:"flex"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"7px 14px",background:"none",border:"none",
                borderBottom:tab===t.id?`2px solid ${C.laranja}`:"2px solid transparent",
                color:tab===t.id?C.textPrimary:C.textMuted,
                fontWeight:tab===t.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{padding:"14px 14px",flex:1}}>

          {/* DIAGNÓSTICO */}
          {tab==="diagnostico" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>

              {/* 1. Contato e responsável */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Contato e responsável</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={labelSt}>Nome do franqueado</label>
                    <input value={localUnit.franchiseeName} onChange={e=>updateLocal({franchiseeName:e.target.value})} placeholder="Nome completo" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>WhatsApp</label>
                    <div style={{display:"flex",gap:6}}>
                      <input value={localUnit.whatsapp} onChange={e=>updateLocal({whatsapp:e.target.value})} placeholder="(XX) XXXXX-XXXX" style={{...inputSt,flex:1}} />
                      {localUnit.whatsapp&&(
                        <a href={`https://wa.me/55${localUnit.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                          style={{...btnSt("#25D36622","#25D366"),border:"1px solid #25D36644",textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>💬</a>
                      )}
                    </div>
                  </div>
                  <div>
                    <label style={labelSt}>Responsável CRM</label>
                    <select value={localUnit.responsible} onChange={e=>updateLocal({responsible:e.target.value})} style={inputSt}>
                      <option>Ivanise</option><option>Will</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Frequência de contato</label>
                    <div style={{padding:"8px 12px",background:C.inset,border:`1px solid ${C.cardBorder}`,borderRadius:8,fontSize:13,color:cfg.color,fontWeight:600}}>{cfg.freqLabel}</div>
                  </div>
                </div>
              </div>

              {/* 2. Faturamento */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Faturamento</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                  {[
                    {label:"Mar/26",value:fmtBRL(localUnit.fatMar),color:C.textPrimary},
                    {label:"Abr/26",value:fmtBRL(localUnit.fatAbr),color:C.textPrimary},
                    {label:"Mai/26",value:fmtBRL(localUnit.fatMai),color:C.laranja},
                  ].map(s=>(
                    <div key={s.label} style={{textAlign:"center",background:C.inset,borderRadius:8,padding:"8px 6px",border:`1px solid ${C.cardBorder}`}}>
                      <div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.value}</div>
                      <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:6}}>
                  <ProgressBar pct={localUnit.metaProgress} height={6} />
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                    <span style={{fontSize:10,color:C.textMuted}}>Mai/26: {fmtBRL(localUnit.fatMai)}</span>
                    <span style={{fontSize:10,color:localUnit.metaProgress>=100?C.verde:C.laranja,fontWeight:700}}>{localUnit.metaProgress}% da meta Jun/26</span>
                    <span style={{fontSize:10,color:C.textMuted}}>Meta: {fmtBRL(localUnit.metaJun)}</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                  <div>
                    <label style={labelSt}>Fat. semana atual (R$)</label>
                    <input value={diag.fat_semana} onChange={e=>saveDiag({fat_semana:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Projeção do mês (R$)</label>
                    <input value={diag.projecao_mes} onChange={e=>saveDiag({projecao_mes:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Correção projetada (R$)</label>
                    <input value={diag.correcao_projetada} onChange={e=>saveDiag({correcao_projetada:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
                  {[
                    {label:"Investimento",value:fmtBRL(localUnit.investment),color:C.textMuted},
                    {label:"ROI acumulado",value:`${localUnit.roiAccum}%`,color:localUnit.roiAccum>=100?C.verde:C.laranja},
                    {label:"Meses p/ payback",value:localUnit.paybackLeft!==null?`~${localUnit.paybackLeft}m`:"—",color:C.azul},
                  ].map(s=>(
                    <div key={s.label} style={{background:C.inset,border:`1px solid ${C.cardBorder}`,borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:9,color:C.textMuted,marginBottom:2}}>{s.label}</div>
                      <div style={{fontSize:13,fontWeight:700,color:s.color}}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Diagnóstico / histórico */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Diagnóstico / histórico</div>
                <textarea value={diag.diagnostico_texto} onChange={e=>saveDiag({diagnostico_texto:e.target.value})}
                  placeholder="Contexto da unidade, tendências, pontos de atenção..."
                  style={{...inputSt,height:80,resize:"vertical",width:"100%",boxSizing:"border-box"}} />
              </div>

              {/* 4. Instagram — verificar antes do contato */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>📱 Instagram — verificar antes do contato</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div>
                    <label style={labelSt}>Último feed (dias atrás)</label>
                    <input value={diag.ig_feed_dias} onChange={e=>saveDiag({ig_feed_dias:e.target.value})} placeholder="ex: 3" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Último Reels (dias atrás)</label>
                    <input value={diag.ig_reels_dias} onChange={e=>saveDiag({ig_reels_dias:e.target.value})} placeholder="ex: 5" style={inputSt} />
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {key:"ig_stories_ativo",label:"Stories ativo"},
                    {key:"ig_trafego_pago",label:"Tráfego pago ativo"},
                    {key:"ig_campanhas_ativas",label:"Campanhas CK ativas"},
                    {key:"ig_participacao_campanhas",label:"Participando das campanhas"},
                  ].map(item=>(
                    <label key={item.key} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.textPrimary}}>
                      <input type="checkbox" checked={!!diag[item.key]} onChange={e=>saveDiag({[item.key]:e.target.checked})}
                        style={{width:16,height:16,cursor:"pointer",accentColor:C.laranja}} />
                      {item.label}
                    </label>
                  ))}
                </div>
                {localUnit.ig_handle&&(
                  <a href={`https://instagram.com/${localUnit.ig_handle.replace("@","")}`} target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-block",marginTop:10,fontSize:11,color:C.azul,textDecoration:"none"}}>
                    📸 Ver @{localUnit.ig_handle} →
                  </a>
                )}
              </div>

              {/* 5. Comercial da semana */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>🛒 Comercial da semana</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div>
                    <label style={labelSt}>Novos clientes</label>
                    <input value={diag.comercial_novos} onChange={e=>saveDiag({comercial_novos:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Renovações fechadas</label>
                    <input value={diag.comercial_renovacoes} onChange={e=>saveDiag({comercial_renovacoes:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Leads em aberto</label>
                    <input value={diag.comercial_leads} onChange={e=>saveDiag({comercial_leads:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Atendimentos FDS</label>
                    <input value={diag.comercial_atend_fds} onChange={e=>saveDiag({comercial_atend_fds:e.target.value})} placeholder="0" style={inputSt} />
                  </div>
                </div>
                <div>
                  <label style={labelSt}>Dificuldade da semana</label>
                  <input value={diag.comercial_dificuldade} onChange={e=>saveDiag({comercial_dificuldade:e.target.value})} placeholder="Ex: cancelamentos, concorrência, objeções..." style={inputSt} />
                </div>
              </div>

              {/* 6. Resumo das reuniões */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>📅 Reuniões</div>
                {unitMeetings.length===0?(
                  <div style={{fontSize:12,color:C.textMuted,textAlign:"center",padding:"12px 0"}}>Nenhuma reunião registrada para esta unidade</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {unitMeetings.slice(0,3).map(m=>(
                      <div key={m.id} style={{background:C.inset,border:`1px solid ${C.cardBorder}`,borderRadius:8,padding:"10px 12px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.textPrimary}}>{fmtDate(m.data)} · {m.tipo}</span>
                          {m.docId&&<a href={`https://docs.google.com/document/d/${m.docId}`} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.azul,textDecoration:"none"}}>🔗 Ata</a>}
                        </div>
                        <div style={{fontSize:12,color:C.textPrimary,lineHeight:1.4,marginBottom:m.tarefas?.length>0?6:0}}>{m.resumo}</div>
                        {m.tarefas?.length>0&&(
                          <div style={{fontSize:10,color:C.textMuted}}>📌 {m.tarefas.length} tarefa(s) gerada(s) · resp: {m.tarefas[0].resp}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={labelSt}>Próxima reunião</label>
                    <input type="date" value={diag.proxima_reuniao} onChange={e=>saveDiag({proxima_reuniao:e.target.value})} style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Link Meet</label>
                    <input value={diag.link_meet} onChange={e=>saveDiag({link_meet:e.target.value})} placeholder="meet.google.com/..." style={inputSt} />
                  </div>
                </div>
                {diag.link_meet&&<a href={diag.link_meet} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:8,fontSize:11,color:C.verde,textDecoration:"none"}}>🎥 Entrar no Meet →</a>}
              </div>

              {/* 7. Tarefas abertas */}
              {openTasks.length>0&&(
                <div style={{background:C.card,border:`1px solid ${overdueTasks.length>0?"#ef444433":C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                      Tarefas abertas ({openTasks.length}){overdueTasks.length>0&&<span style={{color:C.red}}> · {overdueTasks.length} vencidas</span>}
                    </div>
                    <button onClick={()=>setTab("tasks")} style={{background:"none",border:"none",color:C.azul,fontSize:11,cursor:"pointer"}}>Ver todas →</button>
                  </div>
                  {openTasks.slice(0,5).map(t=><TaskRow key={t.id} task={t} onUpdate={updateTask} compact />)}
                </div>
              )}

              {/* 8. Checklists */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>✅ Checklist semanal</div>
                  {[
                    {key:"check_ig_verificado",label:"Instagram verificado antes do contato"},
                    {key:"check_wpp_enviado",label:"WhatsApp de acompanhamento enviado"},
                  ].map(item=>(
                    <label key={item.key} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.textPrimary,marginBottom:8}}>
                      <input type="checkbox" checked={!!diag[item.key]} onChange={e=>saveDiag({[item.key]:e.target.checked})}
                        style={{width:15,height:15,cursor:"pointer",accentColor:C.verde}} />
                      <span style={{textDecoration:diag[item.key]?"line-through":"none",color:diag[item.key]?C.textMuted:C.textPrimary}}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>✅ Checklist mensal</div>
                  {[
                    {key:"check_form_preenchido",label:"Formulário pré-reunião preenchido"},
                    {key:"check_reuniao_realizada",label:"Reunião realizada"},
                  ].map(item=>(
                    <label key={item.key} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.textPrimary,marginBottom:8}}>
                      <input type="checkbox" checked={!!diag[item.key]} onChange={e=>saveDiag({[item.key]:e.target.checked})}
                        style={{width:15,height:15,cursor:"pointer",accentColor:C.verde}} />
                      <span style={{textDecoration:diag[item.key]?"line-through":"none",color:diag[item.key]?C.textMuted:C.textPrimary}}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TASKS */}
          {tab==="tasks" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:13,color:C.textMuted}}>{openTasks.length} abertas · {doneTasks.length} concluídas</div>
              </div>
              {showNewTask && (
                <div style={{background:C.card,border:`1px solid ${C.azul}44`,borderRadius:10,padding:"14px",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Nova tarefa</div>
                  <input value={newTask.titulo} onChange={e=>setNewTask({...newTask,titulo:e.target.value})}
                    placeholder="Título da tarefa" style={{...inputSt,marginBottom:8}} />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                    <select value={newTask.responsavel} onChange={e=>setNewTask({...newTask,responsavel:e.target.value})} style={inputSt}>
                      <option>Ivanise</option><option>Will</option><option>Franqueado</option><option>Outro</option>
                    </select>
                    <select value={newTask.prioridade} onChange={e=>setNewTask({...newTask,prioridade:e.target.value})} style={inputSt}>
                      <option>Alta</option><option>Média</option><option>Baixa</option>
                    </select>
                    <select value={newTask.status} onChange={e=>setNewTask({...newTask,status:e.target.value})} style={inputSt}>
                      {Object.entries(STATUS_TASK).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  {taskError&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>⚠️ {taskError}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addTask} style={btnSt(C.azul)}>Criar</button>
                    <button onClick={()=>{setShowNewTask(false);setTaskError("");}} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
                  </div>
                </div>
              )}
              {(localUnit.tasks||[]).length===0?(
                <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted}}>
                  <div style={{fontSize:28,marginBottom:6}}>✅</div>
                  <div>Sem tarefas. Tudo limpo!</div>
                </div>
              ):(
                <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,overflow:"hidden"}}>
                  {/* Group by meeting */}
                  {[...new Set((localUnit.tasks||[]).map(t=>t.meetingData))].sort((a,b)=>b.localeCompare(a)).map(date=>{
                    const meetTasks = (localUnit.tasks||[]).filter(t=>t.meetingData===date);
                    const meeting = localUnit.contacts?.find(c=>c.date===date);
                    return (
                      <div key={date}>
                        <div style={{padding:"8px 14px",background:C.inset,borderBottom:`1px solid ${C.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.textMuted}}>
                            {date ? `📅 Reunião ${fmtDate(date)}` : "📌 Manual"}
                            {meeting&&` · ${meeting.franqueado?.split(",")[0]}`}
                          </span>
                          {meeting?.docLink&&(
                            <a href={meeting.docLink} target="_blank" rel="noopener noreferrer"
                              style={{fontSize:10,color:C.azul,textDecoration:"none"}}>🔗 Ver ata</a>
                          )}
                        </div>
                        {meetTasks.map(t=><TaskRow key={t.id} task={t} onUpdate={updateTask} />)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONTACTS */}
          {tab==="contacts" && (
            <div>
              {showNewContact && (
                <div style={{background:C.card,border:`1px solid ${C.laranja}44`,borderRadius:10,padding:"14px",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar contato</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <div>
                      <label style={labelSt}>Data</label>
                      <input type="date" value={newContact.date} onChange={e=>setNewContact({...newContact,date:e.target.value})} style={inputSt} />
                    </div>
                    <div>
                      <label style={labelSt}>Canal</label>
                      <select value={newContact.tipo} onChange={e=>setNewContact({...newContact,tipo:e.target.value})} style={inputSt}>
                        {["WhatsApp","Ligação","Reunião (Meet)","Visita","Email"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <label style={labelSt}>Resumo</label>
                  <textarea value={newContact.resumo} onChange={e=>setNewContact({...newContact,resumo:e.target.value})}
                    placeholder="O que foi tratado..." style={{...inputSt,height:70,resize:"vertical",marginBottom:8}} />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    <input value={newContact.docLink} onChange={e=>setNewContact({...newContact,docLink:e.target.value})} placeholder="Link da ata (opcional)" style={inputSt} />
                    <input value={newContact.gravacaoLink} onChange={e=>setNewContact({...newContact,gravacaoLink:e.target.value})} placeholder="Link da gravação (opcional)" style={inputSt} />
                  </div>
                  {contactError&&<div style={{fontSize:11,color:C.red,marginBottom:8}}>⚠️ {contactError}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addContact} style={btnSt(C.laranja)}>Salvar</button>
                    <button onClick={()=>{setShowNewContact(false);setContactError("");}} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
                  </div>
                </div>
              )}
              {(localUnit.contacts||[]).length===0?(
                <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted}}>
                  <div style={{fontSize:32,marginBottom:6}}>📭</div>
                  <div>Nenhum contato registrado</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[...(localUnit.contacts||[])].sort((a,b)=>b.date.localeCompare(a.date)).map(c=>(
                    <div key={c.id} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:4,background:`${C.azul}22`,color:C.azul,border:`1px solid ${C.azul}44`}}>{c.tipo}</span>
                          {c.isRede&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${C.laranja}22`,color:C.laranja}}>REDE</span>}
                          <span style={{fontSize:11,color:C.textMuted}}>{c.responsavel}</span>
                        </div>
                        <span style={{fontSize:11,color:C.textMuted}}>{fmtDate(c.date)}</span>
                      </div>
                      {c.franqueado&&<div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>👤 {c.franqueado}</div>}
                      <div style={{fontSize:13,color:C.textPrimary,lineHeight:1.5}}>{c.resumo}</div>
                      <div style={{display:"flex",gap:10,marginTop:8}}>
                        {c.docLink&&<a href={c.docLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.azul,textDecoration:"none"}}>🔗 Ver ata</a>}
                        {c.gravacaoLink&&<a href={c.gravacaoLink} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.verde,textDecoration:"none"}}>📹 Gravação</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTES */}
          {tab==="notes" && (
            <div>
              <label style={{...labelSt,marginBottom:8,display:"block"}}>Observações gerais</label>
              <textarea value={localUnit.notes} onChange={e=>updateLocal({notes:e.target.value})}
                placeholder="Anotações livres sobre a unidade..."
                style={{...inputSt,height:280,resize:"vertical",width:"100%"}} />
            </div>
          )}

          {/* KANBAN */}
          {tab==="kanban" && (
            <UnitKanban tasks={localUnit.tasks||[]} onMoveTask={(taskId,newStatus)=>updateTask(taskId,{status:newStatus})} onEditTask={(taskId,updates)=>updateTask(taskId,updates)} />
          )}
        </div>
      </div>
    </div>
  );
}
