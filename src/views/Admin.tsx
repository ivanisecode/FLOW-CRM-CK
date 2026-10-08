import { useState, useMemo } from "react";
import { C, TODAY } from "../lib/constants";
import { fmtDate } from "../lib/helpers";
import { btnSt, inputSt, labelSt } from "../lib/styles";

const UNIT_STATUS_CFG = {
  em_inauguracao: { label: "🏗️ Em inauguração", color: C.amareloTxt, bg: "#fff8e1", fase: "Gestação" },
  bercario:       { label: "🐣 Berçário", color: C.bercario, bg: "#f0ebff", fase: "Gestação" },
  pos_inauguracao:{ label: "🌱 Pós-inauguração", color: C.verde, bg: "#e8f5ee", fase: "Gestação" },
  g1:             { label: "🏆 G1 Líder", color: C.laranja, bg: "#fff3e6", fase: "Operação" },
  g2:             { label: "🔥 G2 Aceleração", color: C.verde, bg: "#e8f5ee", fase: "Operação" },
  g3:             { label: "📈 G3 Potencial", color: C.azul, bg: "#eaeffa", fase: "Operação" },
  g4:             { label: "⚠️ G4 Crítica", color: C.red, bg: "#fdecea", fase: "Operação" },
};


function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2,8);
}

// ─── 1. USUÁRIOS ─────────────────────────────────────────────
export function UsuariosView({ usuarios, onSave, onDelete }) {
  const [form, setForm] = useState({ nome:"", email:"", whatsapp:"" });
  const [editId, setEditId] = useState(null);

  function submit() {
    if (!form.nome.trim()) return;
    onSave({ id: editId || uid(), ...form });
    setForm({ nome:"", email:"", whatsapp:"" }); setEditId(null);
  }
  function edit(u){ setForm({nome:u.nome,email:u.email||"",whatsapp:u.whatsapp||""}); setEditId(u.id); }

  return (
    <div style={{padding:"14px",maxWidth:760,margin:"0 auto"}}>
      <div style={{fontSize:15,fontWeight:800,color:C.textPrimary,marginBottom:4}}>👥 Usuários</div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:14}}>Cadastre supervisores e responsáveis pelas carteiras de franquias.</div>

      <div style={{background:C.card,border:`1.5px solid ${editId?C.laranja:C.cardBorder}`,borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:800,color:C.textPrimary,marginBottom:10}}>{editId?"✏️ Editar usuário":"+ Novo usuário"}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:10}}>
          <div><label style={labelSt}>Nome *</label><input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: Ivanise" style={inputSt} /></div>
          <div><label style={labelSt}>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@ck.com" style={inputSt} /></div>
          <div><label style={labelSt}>WhatsApp</label><input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="(83) 99999-9999" style={inputSt} /></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={submit} style={btnSt(C.laranja)}>{editId?"💾 Salvar":"+ Cadastrar"}</button>
          {editId&&<button onClick={()=>{setForm({nome:"",email:"",whatsapp:""});setEditId(null);}} style={btnSt("transparent",C.textMuted)}>Cancelar</button>}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {usuarios.length===0&&<div style={{textAlign:"center",padding:"30px",color:C.textMuted,fontSize:12,background:C.card,borderRadius:12,border:`1px dashed ${C.cardBorder}`}}>Nenhum usuário cadastrado ainda</div>}
        {usuarios.map(u=>(
          <div key={u.id} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:C.laranja,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{u.nome.slice(0,2).toUpperCase()}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{u.nome}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{u.email||"sem email"} · {u.whatsapp||"sem whatsapp"}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>edit(u)} style={{...btnSt(C.inset,C.textPrimary),fontSize:10,border:`1px solid ${C.cardBorder}`}}>Editar</button>
              <button onClick={()=>{if(confirm(`Excluir ${u.nome}?`))onDelete(u.id);}} style={{...btnSt(C.redBg,C.red),fontSize:10,border:`1px solid ${C.red}44`}}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. CARTEIRA ─────────────────────────────────────────────
export function CarteiraView({ usuarios, units, onAssign }) {
  const [selUser, setSelUser] = useState(null);
  const [search, setSearch] = useState("");
  const user = usuarios.find(u=>u.id===selUser);

  const naCarteira = useMemo(()=>units.filter(u=>u.responsible===user?.nome),[units,user]);
  const disponiveis = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return units.filter(u=>u.responsible!==user?.nome && (!q||u.name.toLowerCase().includes(q)));
  },[units,user,search]);

  return (
    <div style={{padding:"14px",maxWidth:980,margin:"0 auto"}}>
      <div style={{fontSize:15,fontWeight:800,color:C.textPrimary,marginBottom:4}}>💼 Carteira de franquias</div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:14}}>Selecione um usuário e defina quais unidades fazem parte da sua carteira.</div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {usuarios.map(u=>{
          const sel=u.id===selUser;
          const count=units.filter(x=>x.responsible===u.nome).length;
          return (
            <button key={u.id} onClick={()=>setSelUser(u.id)} style={{
              display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:30,cursor:"pointer",fontFamily:"inherit",
              background:sel?C.laranja:C.card,color:sel?"#fff":C.textPrimary,
              border:`1.5px solid ${sel?C.laranja:C.cardBorder}`,fontWeight:700,fontSize:12,
            }}>
              <span style={{width:24,height:24,borderRadius:"50%",background:sel?"rgba(255,255,255,0.3)":C.laranja,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{u.nome.slice(0,2).toUpperCase()}</span>
              {u.nome}<span style={{fontSize:10,opacity:0.8}}>({count})</span>
            </button>
          );
        })}
        {usuarios.length===0&&<span style={{fontSize:12,color:C.textMuted}}>Cadastre usuários primeiro no menu Usuários.</span>}
      </div>

      {user&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:12}}>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"14px 16px"}}>
            <div style={{fontSize:13,fontWeight:800,color:C.textPrimary,marginBottom:10}}>✅ Na carteira de {user.nome} ({naCarteira.length})</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:420,overflowY:"auto"}}>
              {naCarteira.length===0&&<div style={{fontSize:11,color:C.textMuted,padding:"10px 0"}}>Nenhuma unidade nesta carteira.</div>}
              {naCarteira.map(u=>(
                <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.inset,borderRadius:8,padding:"8px 11px"}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{u.name}</span>
                  <button onClick={()=>onAssign(u.id,null)} style={{...btnSt(C.redBg,C.red),fontSize:10,padding:"4px 10px",border:`1px solid ${C.red}44`}}>Remover</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"14px 16px"}}>
            <div style={{fontSize:13,fontWeight:800,color:C.textPrimary,marginBottom:8}}>➕ Disponíveis / outras carteiras</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar unidade..." style={{...inputSt,marginBottom:8}} />
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:380,overflowY:"auto"}}>
              {disponiveis.map(u=>(
                <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.inset,borderRadius:8,padding:"8px 11px"}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{u.name}</span>
                    {u.responsible&&<span style={{fontSize:9,color:C.textMuted,marginLeft:6}}>({u.responsible})</span>}
                  </div>
                  <button onClick={()=>onAssign(u.id,user.nome)} style={{...btnSt("#e8f5ee","#1a7a45"),fontSize:10,padding:"4px 10px",border:"1px solid #b0ddc3"}}>+ Adicionar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 3. CADASTRO DE UNIDADES ─────────────────────────────────
function UnitFormModal({ unit, usuarios, onClose, onSave }) {
  const blank = {
    name:"", responsavelOp:"", cnpj:"", razaoSocial:"", endereco:"",
    telefonePessoal:"", telefoneAtendimento:"", email:"",
    dataInauguracao:"", dataCadastro: TODAY.toISOString().slice(0,10),
    isRepasse:false, statusUnidade:"em_inauguracao", responsible:"",
  };
  const [f, setF] = useState(unit ? {...blank, ...unit} : blank);
  const set = (k,v)=>setF(p=>({...p,[k]:v}));

  return (
    <div style={{position:"fixed",inset:0,background:"#3a3020bb",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:600,overflowY:"auto",padding:"20px 12px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:16,width:"min(640px,100%)",overflow:"hidden",boxShadow:"0 12px 40px #3a302033"}}>
        <div style={{height:6,background:"linear-gradient(90deg,#f19134 0%,#f9d856 100%)"}} />
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:800,color:C.textPrimary}}>{unit?"✏️ Editar unidade":"🏪 Nova unidade"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textMuted,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"18px 20px",maxHeight:"70vh",overflowY:"auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
            <div><label style={labelSt}>Nome da unidade *</label><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Ex: PR - TOLEDO" style={inputSt} /></div>
            <div><label style={labelSt}>Responsável da operação</label><input value={f.responsavelOp} onChange={e=>set("responsavelOp",e.target.value)} placeholder="Nome do franqueado" style={inputSt} /></div>
            <div><label style={labelSt}>CNPJ</label><input value={f.cnpj} onChange={e=>set("cnpj",e.target.value)} placeholder="00.000.000/0001-00" style={inputSt} /></div>
            <div><label style={labelSt}>Razão social</label><input value={f.razaoSocial} onChange={e=>set("razaoSocial",e.target.value)} style={inputSt} /></div>
            <div style={{gridColumn:"1/-1"}}><label style={labelSt}>Endereço</label><input value={f.endereco} onChange={e=>set("endereco",e.target.value)} placeholder="Rua, nº, bairro, cidade - UF" style={inputSt} /></div>
            <div><label style={labelSt}>Telefone pessoal</label><input value={f.telefonePessoal} onChange={e=>set("telefonePessoal",e.target.value)} style={inputSt} /></div>
            <div><label style={labelSt}>Telefone de atendimento</label><input value={f.telefoneAtendimento} onChange={e=>set("telefoneAtendimento",e.target.value)} style={inputSt} /></div>
            <div><label style={labelSt}>Email</label><input value={f.email} onChange={e=>set("email",e.target.value)} style={inputSt} /></div>
            <div><label style={labelSt}>Data de inauguração</label><input type="date" value={f.dataInauguracao} onChange={e=>set("dataInauguracao",e.target.value)} style={inputSt} /></div>
            <div><label style={labelSt}>Data do cadastro</label><input type="date" value={f.dataCadastro} onChange={e=>set("dataCadastro",e.target.value)} style={inputSt} /></div>
            <div>
              <label style={labelSt}>Status da unidade</label>
              <select value={f.statusUnidade} onChange={e=>set("statusUnidade",e.target.value)} style={inputSt}>
                <optgroup label="Gestação">
                  <option value="em_inauguracao">🏗️ Em inauguração</option>
                  <option value="bercario">🐣 Berçário</option>
                  <option value="pos_inauguracao">🌱 Pós-inauguração (até 120 dias)</option>
                </optgroup>
                <optgroup label="Operação (por faturamento/idade)">
                  <option value="g1">🏆 G1 Líder</option>
                  <option value="g2">🔥 G2 Aceleração</option>
                  <option value="g3">📈 G3 Potencial</option>
                  <option value="g4">⚠️ G4 Crítica</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label style={labelSt}>Carteira (responsável CK)</label>
              <select value={f.responsible} onChange={e=>set("responsible",e.target.value)} style={inputSt}>
                <option value="">— Sem carteira —</option>
                {usuarios.map(u=><option key={u.id} value={u.nome}>{u.nome}</option>)}
              </select>
            </div>
          </div>

          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:12,
            background:f.isRepasse?"#fff3e6":C.inset,border:`1px solid ${f.isRepasse?C.laranja:C.cardBorder}`,borderRadius:8,padding:"9px 12px"}}>
            <input type="checkbox" checked={f.isRepasse} onChange={e=>set("isRepasse",e.target.checked)} style={{accentColor:C.laranja,width:16,height:16}} />
            <span style={{fontSize:12,fontWeight:700,color:f.isRepasse?C.laranja:C.textPrimary}}>🔄 Unidade de repasse</span>
          </label>
        </div>
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.cardBorder}`,display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          <button onClick={()=>{ if(!f.name.trim())return; onSave({id:f.id||uid(),...f}); onClose(); }} style={btnSt(C.laranja)}>💾 Salvar unidade</button>
        </div>
      </div>
    </div>
  );
}

export function CadastroUnidadesView({ units, usuarios, onSaveUnit, onImportClick }) {
  const [search, setSearch] = useState("");
  const [modalUnit, setModalUnit] = useState(undefined); // undefined=fechado, null=novo
  const filtered = units.filter(u=>!search||u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{padding:"14px",maxWidth:1000,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:6}}>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:C.textPrimary}}>🏪 Cadastro de unidades</div>
          <div style={{fontSize:11,color:C.textMuted}}>{units.length} unidades cadastradas (carteiras ativas importadas da planilha).</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onImportClick} style={{...btnSt(C.inset,C.textPrimary),border:`1px solid ${C.cardBorder}`,fontSize:12}}>📄 Importar faturamento</button>
          <button onClick={()=>setModalUnit(null)} style={{...btnSt(C.laranja),fontSize:12}}>+ Nova unidade</button>
        </div>
      </div>

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar unidade..." style={{...inputSt,maxWidth:300,marginBottom:12}} />

      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",minWidth:680,borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.inset,borderBottom:`1px solid ${C.cardBorder}`}}>
              {["Unidade","Status","Carteira","Inauguração","CNPJ","Repasse",""].map(h=>(
                <th key={h} style={{padding:"9px 12px",fontSize:9,color:C.textMuted,textAlign:"left",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(u=>{
                const st=UNIT_STATUS_CFG[u.statusUnidade]||UNIT_STATUS_CFG[ (u.group||"").toLowerCase() ]||null;
                return (
                  <tr key={u.id} style={{borderBottom:`1px solid ${C.insetBorder}`}}>
                    <td style={{padding:"10px 12px"}}><span style={{fontSize:12,fontWeight:700,color:C.textPrimary}}>{u.name}</span></td>
                    <td style={{padding:"10px 12px"}}>
                      {st?<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,background:st.bg,color:st.color}}>{st.label}</span>:<span style={{fontSize:10,color:C.textMuted}}>—</span>}
                    </td>
                    <td style={{padding:"10px 12px"}}><span style={{fontSize:11,fontWeight:600,color:u.responsible==="Will"?C.azul:u.responsible?C.laranja:C.textMuted}}>{u.responsible||"—"}</span></td>
                    <td style={{padding:"10px 12px",fontSize:11,color:C.textMuted}}>{u.dataInauguracao?fmtDate(u.dataInauguracao):u.inaug?fmtDate(u.inaug):"—"}</td>
                    <td style={{padding:"10px 12px",fontSize:10,color:C.textMuted}}>{u.cnpj||"—"}</td>
                    <td style={{padding:"10px 12px"}}>{u.isRepasse?<span style={{fontSize:10,color:C.laranja,fontWeight:700}}>🔄 Sim</span>:<span style={{fontSize:10,color:C.textMuted}}>—</span>}</td>
                    <td style={{padding:"10px 12px",textAlign:"right"}}>
                      <button onClick={()=>setModalUnit(u)} style={{...btnSt(C.inset,C.textPrimary),fontSize:10,border:`1px solid ${C.cardBorder}`}}>Editar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalUnit!==undefined&&(
        <UnitFormModal unit={modalUnit} usuarios={usuarios} onClose={()=>setModalUnit(undefined)} onSave={onSaveUnit} />
      )}
    </div>
  );
}

// ─── 4. IMPORTAÇÃO DE FATURAMENTO (PDF) ──────────────────────
export function ImportFaturamentoModal({ units, onClose, onImport }) {
  const [unitId, setUnitId] = useState("");
  const [periodo, setPeriodo] = useState(TODAY.toISOString().slice(0,7));
  const [valor, setValor] = useState("");
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [hint, setHint] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0]; if(!file) return;
    setFileName(file.name); setParsing(true); setHint("");
    try {
      // Carrega pdf.js sob demanda
      if(!window.pdfjsLib){
        await new Promise((res,rej)=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const buf = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({data:buf}).promise;
      let text="";
      for(let p=1;p<=pdf.numPages;p++){ const page=await pdf.getPage(p); const tc=await page.getTextContent(); text+=" "+tc.items.map(i=>i.str).join(" "); }
      // Procura valores monetários R$ — pega o maior como provável faturamento total
      const matches = text.match(/(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2}/g) || [];
      const nums = matches.map(m=>parseFloat(m.replace(/[R$\s.]/g,"").replace(",","."))).filter(n=>!isNaN(n));
      if(nums.length){ const maior=Math.max(...nums); setValor(String(maior.toFixed(2))); setHint(`${nums.length} valores detectados — sugerido o maior (R$ ${maior.toFixed(2)}). Confira e ajuste.`); }
      else setHint("Não detectei valores automaticamente. Digite o faturamento manualmente.");
    } catch { setHint("Não consegui ler o PDF. Digite o valor manualmente."); }
    setParsing(false);
  }

  function submit() {
    if(!unitId||!valor||!periodo) return;
    onImport(unitId, { periodo, valor: parseFloat(valor), fileName, importadoEm: new Date().toISOString() });
    onClose();
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#3a3020bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:"20px 12px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,borderRadius:16,width:"min(480px,100%)",overflow:"hidden",boxShadow:"0 12px 40px #3a302033"}}>
        <div style={{height:6,background:"linear-gradient(90deg,#6e81bf 0%,#2db870 100%)"}} />
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:15,fontWeight:800,color:C.textPrimary}}>📄 Importar faturamento</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:C.textMuted,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"18px 20px"}}>
          <label style={labelSt}>Unidade *</label>
          <select value={unitId} onChange={e=>setUnitId(e.target.value)} style={{...inputSt,marginBottom:10}}>
            <option value="">Selecione...</option>
            {units.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <label style={labelSt}>Período de referência *</label>
          <input type="month" value={periodo} onChange={e=>setPeriodo(e.target.value)} style={{...inputSt,marginBottom:10}} />

          <label style={labelSt}>Arquivo PDF do faturamento</label>
          <input type="file" accept="application/pdf" onChange={handleFile} style={{...inputSt,marginBottom:6,padding:"7px 8px"}} />
          {parsing&&<div style={{fontSize:11,color:C.azul,marginBottom:6}}>⏳ Lendo PDF...</div>}
          {hint&&<div style={{fontSize:10,color:C.textMuted,marginBottom:10,background:C.inset,padding:"6px 9px",borderRadius:6}}>{hint}</div>}

          <label style={labelSt}>Valor do faturamento (R$) *</label>
          <input type="number" step="0.01" value={valor} onChange={e=>setValor(e.target.value)} placeholder="0,00" style={{...inputSt,marginBottom:14}} />

          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
            <button onClick={submit} style={btnSt(C.verde)}>💾 Salvar no histórico</button>
          </div>
        </div>
      </div>
    </div>
  );
}
