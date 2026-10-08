import { useState } from "react";
import { GroupBadge, ProgressBar } from "../components/shared";
import { CAMPAIGNS_DATA, getCampanhasForUnit } from "../data/campaigns";
import { C } from "../lib/constants";
import { fmtDate } from "../lib/helpers";
import { inputSt, labelSt } from "../lib/styles";

// ─── CAMPAIGN ADHERENCE COMPONENT ────────────────────────────
export function CampanhasView({ units, onUpdateUnit }) {
  const [filterCamp, setFilterCamp] = useState("copa_junho");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchUnit, setSearchUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Get or init campaign adherence for a unit
  function getAdherencia(unit, campId) {
    return unit.campanhas?.[campId] || {
      aderiu: null, // null=sem resposta, "sim"=total, "parcial"=parcial, "nao"=não aderiu
      itens: {},   // { [itemId]: true/false }
      observacao: "",
      dataRegistro: null,
      responsavel: "Ivanise",
    };
  }

  function updateAdherencia(unit, campId, updates) {
    const current = getAdherencia(unit, campId);
    const updated = {
      ...unit,
      campanhas: {
        ...(unit.campanhas || {}),
        [campId]: {
          ...current,
          ...updates,
          dataRegistro: new Date().toISOString().slice(0,10),
        },
      },
    };
    onUpdateUnit(updated);
  }

  function toggleItem(unit, campId, itemId, value) {
    const current = getAdherencia(unit, campId);
    const newItens = { ...current.itens, [itemId]: value };
    // Auto-calculate adherence level
    const camp = CAMPAIGNS_DATA.find(c=>c.id===campId);
    const total = camp.itensObrigatorios.length;
    const done = Object.values(newItens).filter(Boolean).length;
    let aderiu;
    if (done === 0) aderiu = "nao";
    else if (done === total) aderiu = "sim";
    else aderiu = "parcial";
    updateAdherencia(unit, campId, { itens: newItens, aderiu });
  }

  const activeCamp = CAMPAIGNS_DATA.find(c=>c.id===filterCamp);

  // Filter units that should receive this campaign
  const relevantUnits = units.filter(u => {
    const camps = getCampanhasForUnit(u.name);
    if (!camps.includes(filterCamp)) return false;
    const ms = !searchUnit || u.name.toLowerCase().includes(searchUnit.toLowerCase());
    const adh = getAdherencia(u, filterCamp);
    const fs = filterStatus === "todos" ||
      (filterStatus === "sem_resposta" && adh.aderiu === null) ||
      (filterStatus === "sim" && adh.aderiu === "sim") ||
      (filterStatus === "parcial" && adh.aderiu === "parcial") ||
      (filterStatus === "nao" && adh.aderiu === "nao");
    return ms && fs;
  });

  // Stats
  const campUnits = units.filter(u=>getCampanhasForUnit(u.name).includes(filterCamp));
  const stats = campUnits.reduce((acc,u)=>{
    const adh = getAdherencia(u,filterCamp);
    const k = adh.aderiu || "sem_resposta";
    return {...acc,[k]:(acc[k]||0)+1};
  },{});
  const pctDone = campUnits.length > 0
    ? Math.round(((stats.sim||0) + (stats.parcial||0)) / campUnits.length * 100)
    : 0;

  const adhColors = {
    sim: C.verde, parcial: C.amarelo, nao: C.red, sem_resposta: C.textMuted,
  };
  const adhLabels = {
    sim: "✅ Total", parcial: "⚡ Parcial", nao: "❌ Não aderiu", sem_resposta: "○ Sem resposta",
  };

  return (
    <div style={{padding:"14px 14px"}}>
      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>📣 Controle de Campanhas</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Adesão das unidades às campanhas da rede</div>
      </div>

      {/* Campaign selector */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {CAMPAIGNS_DATA.map(camp=>(
          <button key={camp.id} onClick={()=>{setFilterCamp(camp.id);setSelectedUnit(null);}}
            style={{
              padding:"8px 14px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
              border:`1px solid ${filterCamp===camp.id?camp.cor:C.cardBorder}`,
              background:filterCamp===camp.id?`${camp.cor}22`:C.card,
              color:filterCamp===camp.id?camp.cor:C.textMuted,
              fontWeight:filterCamp===camp.id?700:400,fontSize:12,
            }}>
            {camp.nome}
            <span style={{marginLeft:6,fontSize:10,opacity:0.7}}>{camp.periodo}</span>
          </button>
        ))}
      </div>

      {/* Campaign info banner */}
      {activeCamp && (
        <div style={{background:activeCamp.corBg,border:`1px solid ${activeCamp.cor}33`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:activeCamp.cor}}>{activeCamp.nome}</div>
              <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>{activeCamp.descricao}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:4}}>
                📅 Disponibilizado em: <b style={{color:C.textPrimary}}>{fmtDate(activeCamp.dataDisponibilizacao)}</b>
                {" · "}Período: <b style={{color:C.textPrimary}}>{activeCamp.periodo}</b>
                {" · "}Para: <b style={{color:C.textPrimary}}>{activeCamp.regioes==="NE"?"Nordeste":activeCamp.regioes==="todas"?"Toda a rede":"Sul/Sudeste/CO/Norte"}</b>
              </div>
            </div>
            <div style={{display:"flex",gap:12,flexShrink:0}}>
              {[
                {label:"Total",value:campUnits.length,color:C.textPrimary},
                {label:"Aderiram",value:(stats.sim||0)+(stats.parcial||0),color:C.verde},
                {label:"Não aderiram",value:stats.nao||0,color:C.red},
                {label:"Sem resposta",value:stats.sem_resposta||0,color:C.textMuted},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:9,color:C.textMuted,whiteSpace:"nowrap"}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{marginTop:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:10,color:C.textMuted}}>Adesão da rede</span>
              <span style={{fontSize:10,fontWeight:700,color:pctDone>=80?C.verde:pctDone>=50?C.amarelo:C.red}}>{pctDone}%</span>
            </div>
            <div style={{height:6,borderRadius:3,background:C.cardBorder,overflow:"hidden",display:"flex"}}>
              <div style={{width:`${Math.round(((stats.sim||0)/campUnits.length)*100)}%`,background:C.verde,transition:"width 0.4s"}} />
              <div style={{width:`${Math.round(((stats.parcial||0)/campUnits.length)*100)}%`,background:C.amarelo,transition:"width 0.4s"}} />
            </div>
            <div style={{display:"flex",gap:12,marginTop:4}}>
              {[["✅ Total",C.verde,stats.sim||0],["⚡ Parcial",C.amarelo,stats.parcial||0],["❌ Não",C.red,stats.nao||0],["○ S/resp",C.textMuted,stats.sem_resposta||0]].map(([l,c,v])=>(
                <span key={l} style={{fontSize:9,color:c}}>{l}: {v}</span>
              ))}
            </div>
          </div>

          {activeCamp.observacao && (
            <div style={{marginTop:8,padding:"6px 10px",background:"#fff8e1",borderRadius:6,fontSize:10,color:C.amareloTxt}}>
              {activeCamp.observacao}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={searchUnit} onChange={e=>setSearchUnit(e.target.value)}
          placeholder="🔍 Buscar unidade..." style={{...inputSt,width:200}} />
        {["todos","sem_resposta","sim","parcial","nao"].map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===s?(adhColors[s]||C.laranja):C.cardBorder}`,
            background:filterStatus===s?`${(adhColors[s]||C.laranja)}22`:"transparent",
            color:filterStatus===s?(adhColors[s]||C.laranja):C.textMuted,
          }}>
            {s==="todos"?"Todos":(adhLabels[s]||s)}
            {s!=="todos"&&<span style={{marginLeft:4,opacity:0.7}}>({s==="sem_resposta"?stats.sem_resposta||0:stats[s]||0})</span>}
          </button>
        ))}
      </div>

      <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>{relevantUnits.length} unidades</div>

      {/* Units list */}
      <div style={{display:"flex",flexDirection:"column",gap:0,background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        {relevantUnits.map((unit,i)=>{
          const adh = getAdherencia(unit, filterCamp);
          const isOpen = selectedUnit===unit.id;
          const camp = activeCamp;
          const totalItems = camp?.itensObrigatorios?.length || 0;
          const doneItems = Object.values(adh.itens||{}).filter(Boolean).length;
          const adhColor = adhColors[adh.aderiu||"sem_resposta"];

          return (
            <div key={unit.id} style={{borderBottom:i<relevantUnits.length-1?`1px solid ${C.cardBorder}`:"none"}}>
              {/* Row */}
              <div onClick={()=>setSelectedUnit(isOpen?null:unit.id)}
                style={{padding:"10px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,
                  background:isOpen?C.cardHover:"transparent",transition:"background 0.15s"}}
                onMouseEnter={e=>{if(!isOpen)e.currentTarget.style.background=C.cardHover}}
                onMouseLeave={e=>{if(!isOpen)e.currentTarget.style.background="transparent"}}>

                {/* Unit name + group */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <GroupBadge group={unit.group} small />
                    <span style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{unit.name}</span>
                  </div>
                </div>

                {/* Items progress */}
                <div style={{width:80,flexShrink:0}}>
                  <div style={{fontSize:9,color:C.textMuted,marginBottom:2}}>{doneItems}/{totalItems} itens</div>
                  <ProgressBar pct={totalItems>0?(doneItems/totalItems)*100:0} color={camp?.cor} height={4} />
                </div>

                {/* Adherence selector */}
                <div style={{display:"flex",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                  {[
                    {v:"sim",label:"✅ Total",c:C.verde},
                    {v:"parcial",label:"⚡ Parcial",c:C.amarelo},
                    {v:"nao",label:"❌ Não",c:C.red},
                  ].map(opt=>(
                    <button key={opt.v}
                      onClick={()=>updateAdherencia(unit,filterCamp,{aderiu:opt.v})}
                      style={{
                        padding:"3px 8px",borderRadius:6,fontSize:10,cursor:"pointer",fontFamily:"inherit",
                        border:`1px solid ${adh.aderiu===opt.v?opt.c:C.cardBorder}`,
                        background:adh.aderiu===opt.v?`${opt.c}22`:"transparent",
                        color:adh.aderiu===opt.v?opt.c:C.textMuted,
                        fontWeight:adh.aderiu===opt.v?700:400,
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Status dot */}
                <span style={{width:8,height:8,borderRadius:"50%",background:adhColor,boxShadow:`0 0 5px ${adhColor}`,flexShrink:0}} />

                <span style={{fontSize:11,color:C.textMuted,marginLeft:4}}>{isOpen?"▲":"▼"}</span>
              </div>

              {/* Expanded checklist */}
              {isOpen && activeCamp && (
                <div style={{padding:"12px 16px",background:C.inset,borderTop:`1px solid ${C.cardBorder}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
                    Checklist de itens obrigatórios
                  </div>

                  {/* Checklist */}
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                    {activeCamp.itensObrigatorios.map(item=>{
                      const checked = adh.itens?.[item.id] || false;
                      return (
                        <label key={item.id} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"6px 10px",borderRadius:8,background:checked?`${activeCamp.cor}0a`:"transparent",border:`1px solid ${checked?activeCamp.cor+"33":C.cardBorder}`}}>
                          <input type="checkbox" checked={checked}
                            onChange={e=>toggleItem(unit,filterCamp,item.id,e.target.checked)}
                            style={{marginTop:2,flexShrink:0,accentColor:activeCamp.cor}} />
                          <span style={{fontSize:12,color:checked?C.textPrimary:C.textMuted,lineHeight:1.4}}>
                            {item.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Jogos do Brasil (copa only) */}
                  {activeCamp.jogos && (
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>⚽ Protocolos dos jogos</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {activeCamp.jogos.map(jogo=>{
                          const jogoKey = `jogo_${jogo.data.replace("/","")}`;
                          const jogoFeito = adh.itens?.[jogoKey] || false;
                          return (
                            <label key={jogo.data} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"4px 10px",borderRadius:6,background:jogoFeito?`${C.amarelo}15`:C.card,border:`1px solid ${jogoFeito?C.amarelo+"44":C.cardBorder}`}}>
                              <input type="checkbox" checked={jogoFeito}
                                onChange={e=>toggleItem(unit,filterCamp,jogoKey,e.target.checked)}
                                style={{accentColor:C.amarelo}} />
                              <span style={{fontSize:11,color:jogoFeito?C.amarelo:C.textMuted}}>{jogo.data} · {jogo.descricao}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick adherence + notes */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <label style={labelSt}>Nível de adesão</label>
                      <select value={adh.aderiu||""} onChange={e=>updateAdherencia(unit,filterCamp,{aderiu:e.target.value||null})}
                        style={inputSt}>
                        <option value="">Sem resposta</option>
                        <option value="sim">✅ Total — aderiu completamente</option>
                        <option value="parcial">⚡ Parcial — aderiu com ressalvas</option>
                        <option value="nao">❌ Não aderiu</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelSt}>Responsável pelo check</label>
                      <select value={adh.responsavel||"Ivanise"} onChange={e=>updateAdherencia(unit,filterCamp,{responsavel:e.target.value})}
                        style={inputSt}>
                        <option>Ivanise</option><option>Will</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelSt}>Observações sobre a adesão</label>
                    <textarea value={adh.observacao||""} onChange={e=>updateAdherencia(unit,filterCamp,{observacao:e.target.value})}
                      placeholder="Ex: postou só 2 dos 3 jogos, não fez as enquetes, kit torcedor substituído por outro brinde..."
                      style={{...inputSt,height:55,resize:"vertical"}} />
                  </div>

                  {adh.dataRegistro && (
                    <div style={{marginTop:6,fontSize:10,color:C.textMuted}}>
                      Último registro: {fmtDate(adh.dataRegistro)} · {adh.responsavel}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {relevantUnits.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted}}>Nenhuma unidade com esses filtros</div>
        )}
      </div>

      {/* Summary table — export-friendly */}
      <div style={{marginTop:20}}>
        <div style={{fontSize:12,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>
          Resumo por grupo
        </div>
        <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.cardBorder}`,background:C.inset}}>
                {["Grupo","Unidades","Total","Parcial","Não","Sem resp.","% Adesão"].map(h=>(
                  <th key={h} style={{padding:"7px 12px",fontSize:9,color:C.textMuted,textAlign:"left",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["BERÇÁRIO","G1","G2","G3","G4"].map(group=>{
                const gUnits = campUnits.filter(u=>u.group===group);
                if(gUnits.length===0) return null;
                const gs={sim:0,parcial:0,nao:0,sem_resposta:0};
                gUnits.forEach(u=>{
                  const adh=getAdherencia(u,filterCamp);
                  gs[adh.aderiu||"sem_resposta"]++;
                });
                const pct=gUnits.length>0?Math.round(((gs.sim+gs.parcial)/gUnits.length)*100):0;
                return (
                  <tr key={group} style={{borderBottom:`1px solid ${C.cardBorder}`}}>
                    <td style={{padding:"8px 12px"}}><GroupBadge group={group} small /></td>
                    <td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{gUnits.length}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:C.verde}}>{gs.sim}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:C.amareloTxt}}>{gs.parcial}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:C.red}}>{gs.nao}</td>
                    <td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{gs.sem_resposta}</td>
                    <td style={{padding:"8px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:pct>=80?C.verde:pct>=50?C.amareloTxt:C.red}}>{pct}%</span>
                        <div style={{flex:1,maxWidth:60}}><ProgressBar pct={pct} color={pct>=80?C.verde:pct>=50?C.amarelo:C.red} height={4} /></div>
                      </div>
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
