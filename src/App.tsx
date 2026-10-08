import { useState, useEffect, useCallback } from "react";
import { CKLogo, CKWordmark, TopBar } from "./components/TopBar";
import { MEETINGS_DATA } from "./data/meetings";
import { C } from "./lib/constants";
import { SUPABASE_URL, sb } from "./lib/supabase";
import { buildUnits, buildUnitsFromDB, mergeSeedCadastro } from "./lib/units";
import { AcompanhamentoView } from "./views/AcompanhamentoView";
import { CadastroUnidadesView, CarteiraView, ImportFaturamentoModal, UsuariosView } from "./views/Admin";
import { AniversariantesView } from "./views/AniversariantesView";
import { CampanhasView } from "./views/CampanhasView";
import { DashboardView } from "./views/DashboardView";
import { DiarioView } from "./views/DiarioView";
import { InaugurationModule } from "./views/InaugurationModule";
import { KanbanView } from "./views/KanbanView";
import { LojaJPModule } from "./views/LojaJPModule";
import { MaintenanceModule } from "./views/MaintenanceModule";
import { PanelView, StatsBar } from "./views/PanelView";
import { Print3DModule } from "./views/Print3DModule";
import { UnitDetail } from "./views/UnitDetail";

// ─── APP ROOT ─────────────────────────────────────────────────
export default function FlowCRM() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("connecting");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [usuarios, setUsuarios] = useState([]);
  const [showImport, setShowImport] = useState(false);

  // Load from Supabase on mount — units + contacts + tasks
  useEffect(() => {
    async function loadAll() {
      try {
        const [rows, contacts, tasks] = await Promise.all([
          sb.get("units", "?select=*&order=name"),
          sb.get("contacts", "?select=*&order=date.desc"),
          sb.get("tasks", "?select=*&order=created_at.desc"),
        ]);
        try {
          const us = await sb.get("usuarios", "?select=*&order=nome");
          if (us && us.length) setUsuarios(us);
          else setUsuarios([{id:"u_iva",nome:"Ivanise",email:"",whatsapp:""},{id:"u_will",nome:"Will",email:"",whatsapp:""}]);
        } catch { setUsuarios([{id:"u_iva",nome:"Ivanise",email:"",whatsapp:""},{id:"u_will",nome:"Will",email:"",whatsapp:""}]); }
        if (rows && rows.length > 0) {
          const built = buildUnitsFromDB(rows);
          // Merge contacts from DB into units
          const withContacts = built.map(u => {
            const dbContacts = (contacts||[])
              .filter(c => c.unit_id === u.id)
              .map(c => ({
                id: c.id, date: c.date, tipo: c.tipo,
                responsavel: c.responsavel, franqueado: c.franqueado,
                resumo: c.resumo, docLink: c.doc_link,
                gravacaoLink: c.gravacao_link, isRede: c.is_rede,
              }));
            const dbTasks = (tasks||[])
              .filter(t => t.unit_id === u.id)
              .map(t => ({
                id: t.id, meetingId: t.meeting_id,
                meetingData: t.meeting_data, titulo: t.titulo,
                responsavel: t.responsavel, prioridade: t.prioridade,
                status: t.status, observacao: t.observacao,
                dataInicio: t.data_inicio || null, dataFim: t.data_fim || null,
              }));
            // Merge: DB contacts + meeting contacts (avoid duplicates)
            const meetingContactIds = new Set(u.contacts.map(c => c.id));
            const allContacts = [
              ...u.contacts,
              ...dbContacts.filter(c => !meetingContactIds.has(c.id)),
            ].sort((a,b) => b.date?.localeCompare(a.date||""));
            // Merge: DB tasks + meeting tasks (avoid duplicates)
            const meetingTaskIds = new Set(u.tasks.map(t => t.id));
            const allTasks = [
              ...u.tasks,
              ...dbTasks.filter(t => !meetingTaskIds.has(t.id)),
            ];
            const lastContact = allContacts[0];
            return {
              ...u,
              contacts: allContacts,
              tasks: allTasks,
              lastContactDate: lastContact?.date || u.lastContactDate,
            };
          });
          const enriched = mergeSeedCadastro(withContacts);
          setUnits(enriched);
          setDbStatus("ok");
        } else {
          setUnits(mergeSeedCadastro(buildUnits()));
          setDbStatus("offline");
        }
      } catch (err) {
        console.warn("Supabase unavailable:", err.message);
        setUnits(mergeSeedCadastro(buildUnits()));
        setUsuarios(prev => prev.length ? prev : [{id:"u_iva",nome:"Ivanise",email:"",whatsapp:""},{id:"u_will",nome:"Will",email:"",whatsapp:""}]);
        setDbStatus("offline");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // ── Usuários ──
  const saveUsuario = useCallback(async (u) => {
    setUsuarios(prev => { const ex = prev.find(x=>x.id===u.id); return ex ? prev.map(x=>x.id===u.id?u:x) : [...prev,u]; });
    if (dbStatus==="ok") { try { await sb.upsert("usuarios", {id:u.id,nome:u.nome,email:u.email||"",whatsapp:u.whatsapp||""}, "id"); } catch(e){ console.warn(e); } }
  }, [dbStatus]);
  const deleteUsuario = useCallback(async (id) => {
    setUsuarios(prev => prev.filter(x=>x.id!==id));
    if (dbStatus==="ok") { try { await fetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${id}`, {method:"DELETE",headers:sb.headers}); } catch(e){ console.warn(e); } }
  }, [dbStatus]);

  // ── Carteira: atribuir responsável a uma unidade ──
  const assignCarteira = useCallback((unitId, nome) => {
    setUnits(prev => prev.map(u => u.id===unitId ? {...u, responsible: nome||""} : u));
    if (dbStatus==="ok") { sb.patch("units", unitId, {responsible: nome||""}).catch(e=>console.warn(e)); }
  }, [dbStatus]);

  // ── Cadastro/edição de unidade ──
  const saveUnitCadastro = useCallback(async (u) => {
    setUnits(prev => { const ex = prev.find(x=>x.id===u.id); return ex ? prev.map(x=>x.id===u.id?{...x,...u}:x) : [...prev, {...u, contacts:[], tasks:[], fatMai:0, metaJun:0, metaProgress:0, group:(u.statusUnidade||"g3").toUpperCase()}]; });
    if (dbStatus==="ok") {
      try {
        await sb.upsert("units", {
          id: u.id, name: u.name, responsavel_op: u.responsavelOp||"", cnpj: u.cnpj||"",
          razao_social: u.razaoSocial||"", endereco: u.endereco||"",
          telefone_pessoal: u.telefonePessoal||"", telefone_atendimento: u.telefoneAtendimento||"",
          email: u.email||"", data_inauguracao: u.dataInauguracao||null, data_cadastro: u.dataCadastro||null,
          is_repasse: !!u.isRepasse, status_unidade: u.statusUnidade||"", responsible: u.responsible||"",
        }, "id");
      } catch(e){ console.warn("Salvar unidade:", e.message); }
    }
  }, [dbStatus]);

  // ── Importar faturamento (PDF → histórico) ──
  const importFaturamento = useCallback(async (unitId, registro) => {
    setUnits(prev => prev.map(u => u.id===unitId ? {...u, faturamentoHist:[...(u.faturamentoHist||[]), registro], fatMai: registro.valor} : u));
    if (dbStatus==="ok") {
      try { await sb.post("faturamento_hist", {unit_id:unitId, periodo:registro.periodo, valor:registro.valor, arquivo:registro.fileName||"", importado_em:registro.importadoEm}); } catch(e){ console.warn("Faturamento:", e.message); }
    }
  }, [dbStatus]);

  const updateUnit = useCallback(async (updated) => {
    setUnits(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (selectedUnit?.id === updated.id) setSelectedUnit(updated);
    if (dbStatus !== "ok") return;

    try {
      // 1. Save unit base fields
      await sb.patch("units", updated.id, {
        franchise_name: updated.franchiseeName,
        whatsapp: updated.whatsapp,
        responsible: updated.responsible,
        notes: updated.notes,
        updated_at: new Date().toISOString(),
      });

      // 2. Save new contacts (those with uuid format — created manually)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;
      for (const contact of (updated.contacts || [])) {
        if (uuidRegex.test(contact.id)) {
          await sb.upsert("contacts", {
            id: contact.id,
            unit_id: updated.id,
            date: contact.date,
            tipo: contact.tipo,
            responsavel: contact.responsavel || "Ivanise",
            franqueado: contact.franqueado || "",
            resumo: contact.resumo || "",
            doc_link: contact.docLink || "",
            gravacao_link: contact.gravacaoLink || "",
            is_rede: contact.isRede || false,
          });
        }
      }

      // 3. Save tasks (new manual ones and status updates)
      for (const task of (updated.tasks || [])) {
        if (uuidRegex.test(task.id) || task.id?.startsWith("manual_")) {
          await sb.upsert("tasks", {
            id: uuidRegex.test(task.id) ? task.id : undefined,
            unit_id: updated.id,
            meeting_id: task.meetingId || "",
            meeting_data: task.meetingData || null,
            titulo: task.titulo,
            responsavel: task.responsavel || "Ivanise",
            prioridade: task.prioridade || "Alta",
            status: task.status || "nao_iniciado",
            observacao: task.observacao || "",
            data_inicio: task.dataInicio || null,
            data_fim: task.dataFim || null,
            updated_at: new Date().toISOString(),
          });
        } else {
          // Update status of existing meeting tasks
          try {
            await sb.upsert("tasks", {
              unit_id: updated.id,
              meeting_id: task.meetingId || task.id || "",
              meeting_data: task.meetingData || null,
              titulo: task.titulo,
              responsavel: task.responsavel || "Ivanise",
              prioridade: task.prioridade || "Alta",
              status: task.status || "nao_iniciado",
              observacao: task.observacao || "",
              data_inicio: task.dataInicio || null,
              data_fim: task.dataFim || null,
              updated_at: new Date().toISOString(),
            });
          } catch { /* ignore */ }
        }
      }
    } catch (err) {
      console.warn("Save error:", err.message);
    }
  }, [dbStatus, selectedUnit]);

  if (loading) {
    return (
      <div style={{
        fontFamily:"'Outfit','Segoe UI',sans-serif",
        background:C.bg, minHeight:"100vh",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:16,
      }}>
        <CKLogo size={52} />
        <CKWordmark size={20} />
        <div style={{fontSize:13, color:C.textMuted}}>Carregando Flow CRM Franquias CK...</div>
        <div style={{width:200, height:4, background:C.cardBorder, borderRadius:2, overflow:"hidden"}}>
          <div style={{
            width:"50%", height:"100%", background:C.laranja, borderRadius:2,
            animation:"loading 1.2s ease-in-out infinite alternate",
          }}/>
        </div>
        <style>{`@keyframes loading{from{margin-left:0}to{margin-left:50%}}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily:"'Outfit','Segoe UI',sans-serif",
      background:C.bg, minHeight:"100vh", color:C.textPrimary,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} dbStatus={dbStatus} />
      <StatsBar units={units} />
      <div style={{maxWidth:"100%", overflowX:"hidden"}}>
        {activeTab==="panel"&&<PanelView units={units} onSelectUnit={setSelectedUnit} />}
        {activeTab==="acomp"&&<AcompanhamentoView units={units} onUpdateUnit={updateUnit} />}
        {activeTab==="usuarios"&&<UsuariosView usuarios={usuarios} onSave={saveUsuario} onDelete={deleteUsuario} />}
        {activeTab==="carteira"&&<CarteiraView usuarios={usuarios} units={units} onAssign={assignCarteira} />}
        {activeTab==="cadastro"&&<CadastroUnidadesView units={units} usuarios={usuarios} onSaveUnit={saveUnitCadastro} onImportClick={()=>setShowImport(true)} />}
        {activeTab==="aniversarios"&&<AniversariantesView units={units} dbStatus={dbStatus} />}
        {activeTab==="dashboard"&&<DashboardView units={units} onSelectUnit={setSelectedUnit} />}
        {activeTab==="diario"&&<DiarioView units={units} dbStatus={dbStatus} />}
        {activeTab==="kanban"&&<KanbanView units={units} onUpdateUnit={updateUnit} />}
        {activeTab==="manutencao"&&<MaintenanceModule dbStatus={dbStatus} />}
        {activeTab==="print3d"&&<Print3DModule dbStatus={dbStatus} />}
        {activeTab==="campanhas"&&<CampanhasView units={units} onUpdateUnit={updateUnit} />}
        {activeTab==="inauguracao"&&<InaugurationModule units={units} dbStatus={dbStatus} />}
        {activeTab==="lojajp"&&<LojaJPModule dbStatus={dbStatus} />}
      </div>
      {selectedUnit&&(
        <UnitDetail
          unit={selectedUnit}
          onClose={()=>setSelectedUnit(null)}
          onUpdate={updateUnit}
          allMeetings={MEETINGS_DATA}
        />
      )}
      {showImport&&(
        <ImportFaturamentoModal units={units} onClose={()=>setShowImport(false)} onImport={importFaturamento} />
      )}
    </div>
  );
}
