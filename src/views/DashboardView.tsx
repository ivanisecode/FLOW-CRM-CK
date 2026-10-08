import { useState } from "react";
import { ProgressBar } from "../components/shared";
import { MEETINGS_DATA } from "../data/meetings";
import { C, TODAY } from "../lib/constants";
import { GROUP_CFG, daysSince, fmtBRL, fmtDate } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";

// ─── DASHBOARD ───────────────────────────────────────────────
// ─── MARKETING SCORE CALCULATOR ─────────────────────────────
function calcMarketingScore(data) {
  if (!data) return null;
  // Stories: meta 35-50/sem → 30pts
  const storiesPts = Math.min(30, Math.round((Math.min(data.stories||0, 50) / 50) * 30));
  // Reels: meta 3-5/sem → 20pts
  const reelsPts = Math.min(20, Math.round((Math.min(data.reels||0, 5) / 5) * 20));
  // Prova social: meta 2/sem → 20pts
  const provaPts = Math.min(20, Math.round((Math.min(data.provasSociais||0, 2) / 2) * 20));
  // Autoridade 70/20/10: sim=15, parcial=8, não=0 → 15pts
  const autoridadePts = data.autoridade70==="sim"?15:data.autoridade70==="parcial"?8:0;
  // Parcerias ativas: meta 4/mes → 15pts
  const parcPts = Math.min(15, Math.round((Math.min(data.parceriasAtivas||0, 4) / 4) * 15));
  const total = storiesPts + reelsPts + provaPts + autoridadePts + parcPts;
  return { total, storiesPts, reelsPts, provaPts, autoridadePts, parcPts,
    nivel: total>=80?"forte":total>=60?"regular":"fraco",
    cor: total>=80?C.verde:total>=60?C.amarelo:C.red,
    label: total>=80?"🟢 Marketing Forte":total>=60?"🟡 Marketing Regular":"🔴 Marketing Fraco" };
}

// ─── PRE-MEETING FORM ────────────────────────────────────────
const Section = ({title, color, children}) => (
  <div style={{marginBottom:16}}>
    <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,paddingBottom:4,borderBottom:`1px solid ${color}33`}}>{title}</div>
    {children}
  </div>
);

const Field = ({label, children}) => (
  <div style={{marginBottom:8}}>
    <label style={labelSt}>{label}</label>
    {children}
  </div>
);

const Grid = ({children, cols=2}) => (
  <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>{children}</div>
);

function PreMeetingForm({ unit, onSave, onClose }) {
  const [form, setForm] = useState({
    // Financeiro
    fatMesAtual: "", metaMes: "", ticketMedio: "",
    // Comercial
    locacoesNovas: "", clientesNovos: "", clientesRecorrentes: "", diasSemLocacao: "",
    // Estoque
    totalPecas: "", pecasAlugadas: "", pecasManutencao: "",
    // Marketing (autodeclarado)
    stories: "", reels: "", provasSociais: "", autoridade70: "nao",
    parceriasAtivas: "", leadsIniciados: "",
    // Qualitativo
    principalDesafio: "", principalVitoria: "", precisaApoio: "",
    dataPreenchimento: TODAY.toISOString().slice(0,10),
  });

  function handleSave() {
    const mktScore = calcMarketingScore({
      stories: Number(form.stories)/4,
      reels: Number(form.reels)/4,
      provasSociais: Number(form.provasSociais)/4,
      autoridade70: form.autoridade70,
      parceriasAtivas: Number(form.parceriasAtivas),
    });
    onSave({ ...form, mktScore });
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#3a3020bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}}>
      <div style={{width:"min(620px,95vw)",maxHeight:"90vh",background:C.bg,borderRadius:16,border:`1px solid ${C.cardBorder}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.textPrimary}}>📋 Formulário Pré-Reunião</div>
            <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{unit.name} · {fmtDate(form.dataPreenchimento)}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textMuted,fontSize:20,cursor:"pointer"}}>×</button>
        </div>

        <div style={{overflowY:"auto",padding:"16px 20px",flex:1}}>
          <Section title="💰 Financeiro" color={C.laranja}>
            <Grid>
              <Field label="Faturamento mês atual (R$)">
                <input value={form.fatMesAtual} onChange={e=>setForm({...form,fatMesAtual:e.target.value})} placeholder="Ex: 3.500" style={inputSt} />
              </Field>
              <Field label="Meta do mês (R$)">
                <input value={form.metaMes} onChange={e=>setForm({...form,metaMes:e.target.value})} placeholder="Ex: 4.000" style={inputSt} />
              </Field>
              <Field label="Ticket médio (R$)">
                <input value={form.ticketMedio} onChange={e=>setForm({...form,ticketMedio:e.target.value})} placeholder="Ex: 280" style={inputSt} />
              </Field>
            </Grid>
          </Section>

          <Section title="📦 Comercial" color={C.azul}>
            <Grid>
              <Field label="Novas locações no mês">
                <input value={form.locacoesNovas} onChange={e=>setForm({...form,locacoesNovas:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
              <Field label="Clientes novos">
                <input value={form.clientesNovos} onChange={e=>setForm({...form,clientesNovos:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
              <Field label="Clientes recorrentes">
                <input value={form.clientesRecorrentes} onChange={e=>setForm({...form,clientesRecorrentes:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
              <Field label="Dias sem locação no mês">
                <input value={form.diasSemLocacao} onChange={e=>setForm({...form,diasSemLocacao:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
            </Grid>
          </Section>

          <Section title="🗂 Estoque" color={C.verde}>
            <Grid cols={3}>
              <Field label="Total de peças">
                <input value={form.totalPecas} onChange={e=>setForm({...form,totalPecas:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
              <Field label="Peças alugadas">
                <input value={form.pecasAlugadas} onChange={e=>setForm({...form,pecasAlugadas:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
              <Field label="Em manutenção">
                <input value={form.pecasManutencao} onChange={e=>setForm({...form,pecasManutencao:e.target.value})} type="number" placeholder="0" style={inputSt} />
              </Field>
            </Grid>
          </Section>

          <Section title="📱 Marketing — autodeclarado" color={C.rosa}>
            <div style={{background:`${C.rosa}11`,border:`1px solid ${C.rosa}22`,borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:10,color:C.textMuted}}>
              ℹ️ Esses dados são preenchidos pelo franqueado antes da reunião. Preencha o que souber ou deixe para o formulário enviado à unidade.
            </div>
            <Grid>
              <Field label="Stories publicados no mês">
                <input value={form.stories} onChange={e=>setForm({...form,stories:e.target.value})} type="number" placeholder="Meta: 140-200/mês" style={inputSt} />
              </Field>
              <Field label="Reels publicados no mês">
                <input value={form.reels} onChange={e=>setForm({...form,reels:e.target.value})} type="number" placeholder="Meta: 12-20/mês" style={inputSt} />
              </Field>
              <Field label="Provas sociais no mês">
                <input value={form.provasSociais} onChange={e=>setForm({...form,provasSociais:e.target.value})} type="number" placeholder="Meta: 8+/mês" style={inputSt} />
              </Field>
              <Field label="Parcerias ativas">
                <input value={form.parceriasAtivas} onChange={e=>setForm({...form,parceriasAtivas:e.target.value})} type="number" placeholder="Meta: 4+" style={inputSt} />
              </Field>
              <Field label="Leads iniciados no mês">
                <input value={form.leadsIniciados} onChange={e=>setForm({...form,leadsIniciados:e.target.value})} type="number" placeholder="Conversas iniciadas" style={inputSt} />
              </Field>
              <Field label="Seguindo regra 70/20/10?">
                <select value={form.autoridade70} onChange={e=>setForm({...form,autoridade70:e.target.value})} style={inputSt}>
                  <option value="nao">❌ Não — muito foco em oferta</option>
                  <option value="parcial">⚡ Parcial — melhorando</option>
                  <option value="sim">✅ Sim — 70% valor / 20% rel. / 10% oferta</option>
                </select>
              </Field>
            </Grid>
          </Section>

          <Section title="💬 Qualitativo" color={C.bercario}>
            <Field label="Principal desafio do mês">
              <textarea value={form.principalDesafio} onChange={e=>setForm({...form,principalDesafio:e.target.value})}
                placeholder="O que mais travou o crescimento?" style={{...inputSt,height:55,resize:"vertical"}} />
            </Field>
            <Field label="Principal vitória do mês">
              <textarea value={form.principalVitoria} onChange={e=>setForm({...form,principalVitoria:e.target.value})}
                placeholder="O que funcionou bem?" style={{...inputSt,height:55,resize:"vertical"}} />
            </Field>
            <Field label="Precisa de apoio em quê?">
              <textarea value={form.precisaApoio} onChange={e=>setForm({...form,precisaApoio:e.target.value})}
                placeholder="O que você espera desta reunião?" style={{...inputSt,height:55,resize:"vertical"}} />
            </Field>
          </Section>
        </div>

        <div style={{padding:"12px 20px",borderTop:`1px solid ${C.cardBorder}`,display:"flex",gap:8}}>
          <button onClick={handleSave} style={btnSt(C.laranja)}>Salvar formulário</button>
          <button onClick={onClose} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD VIEW ──────────────────────────────────────────
const Card = ({title,value,sub,color,onClick}) => (
  <div onClick={onClick} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px",cursor:onClick?"pointer":"default"}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.background=C.cardHover}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.background=C.card}}>
    <div style={{fontSize:22,fontWeight:800,color:color||C.textPrimary}}>{value}</div>
    <div style={{fontSize:11,fontWeight:700,color:C.textPrimary,marginTop:2}}>{title}</div>
    {sub&&<div style={{fontSize:10,color:C.textMuted,marginTop:1}}>{sub}</div>}
  </div>
);

const SectionTitle = ({children,color}) => (
  <div style={{fontSize:10,fontWeight:700,color:color||C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10,paddingBottom:4,borderBottom:`1px solid ${(color||C.textMuted)+"33"}`}}>
    {children}
  </div>
);

export function DashboardView({ units }) {
  const [viewMode, setViewMode] = useState("diretoria"); // diretoria | supervisao | rede
  const [showPreMeeting, setShowPreMeeting] = useState(null);
  const [preMeetingData, setPreMeetingData] = useState({});

  // ── Supervisão metrics ──────────────────────────────────────
  const allTasks = units.flatMap(u=>(u.tasks||[]).map(t=>({...t,unitName:u.name,group:u.group})));
  const openTasks = allTasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
  const inProgressTasks = allTasks.filter(t=>t.status==="em_andamento");
  const doneTasks = allTasks.filter(t=>t.status==="concluido");
  const overdueTasks = openTasks.filter(t=>t.meetingData&&daysSince(t.meetingData)>14);

  const unitsWithContact = units.filter(u=>u.lastContactDate);
  const unitsNeedContact = units.filter(u=>{
    const days = u.lastContactDate?daysSince(u.lastContactDate):999;
    return days>=(GROUP_CFG[u.group]?.freq||10);
  });
  const meetingsThisMonth = MEETINGS_DATA.filter(m=>m.data.startsWith("2026-05")||m.data.startsWith("2026-06")).length;
  const groupCount = ["BERÇÁRIO","G1","G2","G3","G4"].reduce((a,g)=>({...a,[g]:units.filter(u=>u.group===g).length}),{});

  // ── Rede financeiro (aggregated from unit data) ─────────────
  const totalFatMai = units.reduce((s,u)=>s+u.fatMai,0);
  const totalMeta = units.reduce((s,u)=>s+u.metaJun,0);
  const totalFatAbr = units.reduce((s,u)=>s+u.fatAbr,0);
  const variacaoMoM = totalFatAbr>0?((totalFatMai-totalFatAbr)/totalFatAbr*100).toFixed(1):0;
  const unitsAcimaMetaMai = units.filter(u=>u.metaJun>0&&u.fatMai>=u.metaJun).length;
  const unitsSemFat = units.filter(u=>u.fatMai===0).length;

  // ── Equipe (Ivanise + Will) ─────────────────────────────────
  const ivaniseTasks = openTasks.filter(t=>t.responsavel==="Ivanise");
  const willTasks = openTasks.filter(t=>t.responsavel==="Will");
  const ivaniseInProgress = ivaniseTasks.filter(t=>t.status==="em_andamento");
  const willInProgress = willTasks.filter(t=>t.status==="em_andamento");

  const TEAM = [
    { nome:"Ivanise", cor:C.laranja, funcao:"Supervisora Nacional",
      abertas:ivaniseTasks.length, emAndamento:ivaniseInProgress.length,
      concluidas:doneTasks.filter(t=>t.responsavel==="Ivanise").length },
    { nome:"Will", cor:C.azul, funcao:"Analista de Dados",
      abertas:willTasks.length, emAndamento:willInProgress.length,
      concluidas:doneTasks.filter(t=>t.responsavel==="Will").length },
  ];

  const VIEWS = [
    {id:"diretoria",label:"👔 Visão Diretoria"},
    {id:"supervisao",label:"📋 Supervisão"},
    {id:"rede",label:"🌐 Rede"},
  ];

  return (
    <div style={{padding:"14px 14px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>📊 Dashboard — Flow CRM Franquias CK</div>
          <div style={{fontSize:12,color:C.textMuted,marginTop:2}}>
            Atualizado: {fmtDate(TODAY.toISOString().slice(0,10))} · Supervisora: Ivanise Leite
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {VIEWS.map(v=>(
            <button key={v.id} onClick={()=>setViewMode(v.id)} style={{
              padding:"6px 12px",borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"inherit",
              border:`1px solid ${viewMode===v.id?C.laranja:C.cardBorder}`,
              background:viewMode===v.id?`${C.laranja}22`:"transparent",
              color:viewMode===v.id?C.laranja:C.textMuted,fontWeight:viewMode===v.id?700:400,
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* ── VISÃO DIRETORIA ────────────────────────────────── */}
      {viewMode==="diretoria"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Headline numbers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            <Card title="Faturamento mai/26" value={fmtBRL(totalFatMai)} sub={`${variacaoMoM>0?"+":""}${variacaoMoM}% vs abr`} color={Number(variacaoMoM)>=0?C.verde:C.red} />
            <Card title="Meta jun/26 (rede)" value={fmtBRL(totalMeta)} sub={`${unitsAcimaMetaMai} unidades acima da meta`} color={C.laranja} />
            <Card title="Unidades ativas" value={units.length} sub={`${groupCount["BERÇÁRIO"]} em berçário`} color={C.textPrimary} />
            <Card title="Sem faturamento" value={unitsSemFat} sub="unidades zeradas em mai" color={unitsSemFat>5?C.red:C.amarelo} />
          </div>

          {/* O que estamos fazendo — equipe */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <SectionTitle color={C.laranja}>O que a equipe está fazendo agora</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {TEAM.map(p=>(
                <div key={p.nome} style={{background:C.inset,borderRadius:10,padding:"12px 14px",border:`1px solid ${p.cor}33`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`${p.cor}22`,border:`2px solid ${p.cor}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:p.cor}}>{p.nome[0]}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{p.nome}</div>
                      <div style={{fontSize:10,color:C.textMuted}}>{p.funcao}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    {[
                      {label:"Em andamento",value:p.emAndamento,color:p.cor},
                      {label:"Abertas",value:p.abertas,color:p.abertas>10?C.amarelo:C.textMuted},
                      {label:"Concluídas",value:p.concluidas,color:C.verde},
                    ].map(s=>(
                      <div key={s.label} style={{textAlign:"center",padding:"6px 4px",background:C.card,borderRadius:6}}>
                        <div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.value}</div>
                        <div style={{fontSize:8,color:C.textMuted}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rede snapshot */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* Distribuição grupos */}
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
              <SectionTitle>Distribuição da rede por grupo</SectionTitle>
              {Object.entries(groupCount).map(([g,cnt])=>{
                const cfg=GROUP_CFG[g];
                const pct=Math.round((cnt/units.length)*100);
                return(
                  <div key={g} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:10,color:cfg.color,fontWeight:700}}>{cfg.label}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{cnt} unid. ({pct}%)</span>
                    </div>
                    <ProgressBar pct={pct} color={cfg.color} height={5} />
                  </div>
                );
              })}
            </div>

            {/* Contato e demanda */}
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
              <SectionTitle>Acompanhamento e demanda</SectionTitle>
              {[
                {label:"Unidades com contato registrado",value:unitsWithContact.length,total:units.length,color:C.verde},
                {label:"Unidades precisando de contato",value:unitsNeedContact.length,total:units.length,color:C.red},
                {label:"Reuniões mai/jun",value:meetingsThisMonth,total:null,color:C.laranja},
                {label:"Tarefas geradas (total)",value:allTasks.length,total:null,color:C.azul},
                {label:"Tarefas em andamento",value:inProgressTasks.length,total:null,color:C.amareloTxt},
                {label:"Tarefas vencidas",value:overdueTasks.length,total:null,color:overdueTasks.length>0?C.red:C.verde},
              ].map(s=>(
                <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                  <span style={{fontSize:11,color:C.textMuted}}>{s.label}</span>
                  <span style={{fontSize:12,fontWeight:700,color:s.color}}>
                    {s.value}{s.total?`/${s.total}`:""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Faturamento por grupo */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <SectionTitle color={C.laranja}>Faturamento mai/26 por grupo</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {["BERÇÁRIO","G1","G2","G3","G4"].map(g=>{
                const gUnits=units.filter(u=>u.group===g);
                const gFat=gUnits.reduce((s,u)=>s+u.fatMai,0);
                const gMeta=gUnits.reduce((s,u)=>s+u.metaJun,0);
                const pct=gMeta>0?Math.round((gFat/gMeta)*100):0;
                const cfg=GROUP_CFG[g];
                return(
                  <div key={g} style={{background:C.inset,borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:cfg.color,fontWeight:700,marginBottom:4}}>{cfg.label}</div>
                    <div style={{fontSize:13,fontWeight:800,color:C.textPrimary}}>{fmtBRL(gFat)}</div>
                    <div style={{fontSize:9,color:C.textMuted,marginTop:2,marginBottom:4}}>{gUnits.length} un. · meta {pct}%</div>
                    <ProgressBar pct={pct} color={cfg.color} height={3} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas */}
          {(overdueTasks.length>0||unitsNeedContact.length>0||unitsSemFat>0)&&(
            <div style={{background:C.card,border:`1px solid ${C.red}33`,borderRadius:12,padding:"14px 16px"}}>
              <SectionTitle color={C.red}>⚠️ Alertas que precisam de atenção</SectionTitle>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {unitsSemFat>0&&<div style={{fontSize:12,color:C.amareloTxt}}>• {unitsSemFat} unidades sem faturamento em maio — verificar operação</div>}
                {unitsNeedContact.length>0&&<div style={{fontSize:12,color:C.amareloTxt}}>• {unitsNeedContact.length} unidades com contato atrasado conforme frequência do grupo</div>}
                {overdueTasks.length>0&&<div style={{fontSize:12,color:C.red}}>• {overdueTasks.length} tarefas vencidas (origem: reuniões há mais de 14 dias sem conclusão)</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VISÃO SUPERVISÃO ──────────────────────────────── */}
      {viewMode==="supervisao"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Equipe detalhada */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <SectionTitle color={C.laranja}>Demandas iniciadas e em andamento</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {[
                {label:"Ivanise — Em andamento",value:ivaniseInProgress.length,color:C.laranja},
                {label:"Ivanise — Abertas",value:ivaniseTasks.length,color:C.laranja},
                {label:"Will — Em andamento",value:willInProgress.length,color:C.azul},
                {label:"Will — Abertas",value:willTasks.length,color:C.azul},
              ].map(s=>(
                <div key={s.label} style={{background:C.inset,borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarefas em andamento — Ivanise */}
          {ivaniseInProgress.length>0&&(
            <div style={{background:C.card,border:`1px solid ${C.laranja}33`,borderRadius:12,padding:"14px 16px"}}>
              <SectionTitle color={C.laranja}>🟠 Ivanise — Em andamento ({ivaniseInProgress.length})</SectionTitle>
              {ivaniseInProgress.map(t=>(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                  <span style={{fontSize:12,color:C.textPrimary}}>{t.titulo.slice(0,65)}</span>
                  <span style={{fontSize:10,color:C.textMuted,flexShrink:0,marginLeft:8}}>{t.unitName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tarefas em andamento — Will */}
          {willInProgress.length>0&&(
            <div style={{background:C.card,border:`1px solid ${C.azul}33`,borderRadius:12,padding:"14px 16px"}}>
              <SectionTitle color={C.azul}>🔵 Will — Em andamento ({willInProgress.length})</SectionTitle>
              {willInProgress.map(t=>(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                  <span style={{fontSize:12,color:C.textPrimary}}>{t.titulo.slice(0,65)}</span>
                  <span style={{fontSize:10,color:C.textMuted,flexShrink:0,marginLeft:8}}>{t.unitName}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tarefas vencidas */}
          {overdueTasks.length>0&&(
            <div style={{background:C.card,border:`1px solid ${C.red}33`,borderRadius:12,padding:"14px 16px"}}>
              <SectionTitle color={C.red}>⚠️ Vencidas — precisam de atenção ({overdueTasks.length})</SectionTitle>
              {overdueTasks.map(t=>(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                  <div>
                    <span style={{fontSize:12,color:C.textPrimary}}>{t.titulo.slice(0,55)}</span>
                    <span style={{fontSize:10,color:C.textMuted,marginLeft:8}}>{t.unitName}</span>
                  </div>
                  <span style={{fontSize:10,color:C.red,flexShrink:0,marginLeft:8}}>→ {t.responsavel}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reuniões recentes */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <SectionTitle>Últimas reuniões + formulário pré-reunião</SectionTitle>
            {[...MEETINGS_DATA].sort((a,b)=>b.data.localeCompare(a.data)).slice(0,8).map(m=>{
              const unit = units.find(u=>u.name===m.unidade);
              const pmd = unit&&preMeetingData[unit.id];
              const mktScore = pmd?.mktScore;
              return (
                <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{m.unidade}</span>
                      {mktScore&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${mktScore.cor}22`,color:mktScore.cor}}>{mktScore.label}</span>}
                    </div>
                    <span style={{fontSize:10,color:C.textMuted}}>{m.resumo.slice(0,55)}…</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0,marginLeft:10}}>
                    <span style={{fontSize:10,color:C.textMuted}}>{fmtDate(m.data)}</span>
                    <a href={`https://docs.google.com/document/d/${m.docId}/edit`} target="_blank" rel="noopener noreferrer"
                      style={{fontSize:10,color:C.azul,textDecoration:"none"}}>🔗</a>
                    {unit&&(
                      <button onClick={()=>setShowPreMeeting(unit)}
                        style={{fontSize:9,padding:"2px 7px",borderRadius:4,border:`1px solid ${pmd?C.verde:C.laranja}`,
                          background:pmd?`${C.verde}11`:`${C.laranja}11`,color:pmd?C.verde:C.laranja,cursor:"pointer",fontFamily:"inherit"}}>
                        {pmd?"✓ Form preenchido":"📋 Form pré-reunião"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VISÃO REDE ────────────────────────────────────── */}
      {viewMode==="rede"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Marketing Score — piloto top unidades */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <SectionTitle color={C.rosa}>📱 Score de Marketing — unidades com formulário preenchido</SectionTitle>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:10}}>
              {[
                {indicador:"Stories",peso:30,meta:"35-50/sem",desc:"Constância = presença na mente da mãe"},
                {indicador:"Reels",peso:20,meta:"3-5/sem",desc:"Não viralizar — aparecer sempre"},
                {indicador:"Prova Social",peso:20,meta:"2+/sem",desc:"Clientes reais geram confiança"},
                {indicador:"Autoridade 70/20/10",peso:15,meta:"70% valor",desc:"Conteúdo de desenvolvimento infantil"},
                {indicador:"Parcerias",peso:15,meta:"4+/mês",desc:"Pediatras, doulas, escolinhas"},
              ].map(item=>(
                <div key={item.indicador} style={{background:C.inset,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.rosaTxt}}>{item.peso}pts</div>
                  <div style={{fontSize:10,fontWeight:700,color:C.textPrimary,marginTop:2}}>{item.indicador}</div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:2}}>{item.meta}</div>
                </div>
              ))}
            </div>

            {Object.keys(preMeetingData).length===0?(
              <div style={{textAlign:"center",padding:"20px",color:C.textMuted,fontSize:12}}>
                Nenhum formulário pré-reunião preenchido ainda.<br/>
                <span style={{fontSize:11}}>Preencha via botão "📋 Form pré-reunião" na aba Supervisão.</span>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {Object.entries(preMeetingData).map(([unitId, data])=>{
                  const unit = units.find(u=>u.id===Number(unitId));
                  if(!unit||!data.mktScore) return null;
                  const s = data.mktScore;
                  return (
                    <div key={unitId} style={{display:"flex",alignItems:"center",gap:12,padding:"6px 10px",background:C.inset,borderRadius:8}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.textPrimary,flex:1}}>{unit.name}</span>
                      <div style={{width:120}}><ProgressBar pct={s.total} color={s.cor} /></div>
                      <span style={{fontSize:12,fontWeight:800,color:s.cor,width:30,textAlign:"right"}}>{s.total}</span>
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${s.cor}22`,color:s.cor,whiteSpace:"nowrap"}}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4 pilares do dashboard nacional */}
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
            <SectionTitle>Os 4 pilares do dashboard nacional</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {titulo:"💰 Financeiro",itens:["Faturamento","Meta","Ticket Médio","Variação MoM"],fonte:"gesta (CSV Will)",cor:C.laranja},
                {titulo:"📦 Comercial",itens:["Locações novas","Clientes novos","Clientes recorrentes","Dias sem locação"],fonte:"gesta (CSV Will)",cor:C.azul},
                {titulo:"🗂 Estoque",itens:["% Ocupação","Itens em manutenção","Giro top produtos"],fonte:"gesta (CSV Will)",cor:C.verde},
                {titulo:"📱 Marketing",itens:["Stories/semana","Reels/semana","Provas sociais","Parcerias ativas","Leads iniciados"],fonte:"Formulário pré-reunião (autodeclarado)",cor:C.rosa},
              ].map(pilar=>(
                <div key={pilar.titulo} style={{background:C.inset,borderRadius:8,padding:"10px 12px",border:`1px solid ${pilar.cor}22`}}>
                  <div style={{fontSize:12,fontWeight:700,color:pilar.cor,marginBottom:6}}>{pilar.titulo}</div>
                  {pilar.itens.map(item=>(
                    <div key={item} style={{fontSize:11,color:C.textMuted,padding:"2px 0",borderBottom:`1px solid ${C.cardBorder}`}}>· {item}</div>
                  ))}
                  <div style={{fontSize:9,color:C.textMuted,marginTop:6}}>📥 Fonte: {pilar.fonte}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:"8px 10px",background:`${C.amarelo}11`,borderRadius:6,fontSize:10,color:C.amareloTxt}}>
              💡 KPIs e OKRs em desenvolvimento — próxima etapa do Flow CRM Franquias CK
            </div>
          </div>
        </div>
      )}

      {/* Pre-meeting form modal */}
      {showPreMeeting&&(
        <PreMeetingForm
          unit={showPreMeeting}
          onSave={(data)=>{
            setPreMeetingData(prev=>({...prev,[showPreMeeting.id]:data}));
            setShowPreMeeting(null);
          }}
          onClose={()=>setShowPreMeeting(null)}
        />
      )}
    </div>
  );
}
