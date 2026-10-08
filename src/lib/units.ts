import { MEETINGS_DATA } from "../data/meetings";
import { RAW_UNITS } from "../data/rawUnits";
import { REPASSE_BERCARIO } from "../data/repasse";
import { SEED_CADASTRO } from "../data/seedCadastro";
import { INVESTMENT } from "./constants";
import { daysSince, getGroup } from "./helpers";

export const buildUnitsFromDB = (rows) => rows.map((u) => {
  const days = daysSince(u.inaug);
  const group = getGroup(u.fat_mai, u.inaug, u.name);
  const avgTri = ((u.fat_mar||0) + (u.fat_abr||0) + (u.fat_mai||0)) / 3;
  const bercStart = REPASSE_BERCARIO[u.name] || u.inaug;
  const bercDaysUsed = daysSince(bercStart);
  const daysInBercario = group === "BERÇÁRIO" ? 120 - bercDaysUsed : null;
  const isRepasse = u.is_repasse ?? !!REPASSE_BERCARIO[u.name];
  const totalEstFat = avgTri * Math.floor(days / 30);
  const roiAccum = Math.min(Math.round((totalEstFat / INVESTMENT) * 100), 999);
  const paybackLeft = avgTri > 0 ? Math.max(0, Math.round((INVESTMENT - totalEstFat) / avgTri)) : null;
  const metaProgress = u.meta_jun > 0 ? Math.round((u.fat_mai / u.meta_jun) * 100) : 0;

  const unitMeetings = MEETINGS_DATA.filter(m =>
    m.unidade === u.name || (m.extra || []).includes(u.name)
  );
  const lastMeeting = unitMeetings.sort((a,b) => b.data.localeCompare(a.data))[0];

  const tasks = unitMeetings.flatMap(m =>
    (m.tarefas || []).map((t, ti) => ({
      id: `${m.id}_t${ti}`, meetingId: m.id, meetingData: m.data,
      titulo: t.titulo, responsavel: t.resp, prioridade: t.prioridade,
      status: "nao_iniciado", dataConclusao: null, observacao: "",
    }))
  );

  return {
    id: u.id, name: u.name,
    fatMai: u.fat_mai||0, fatAbr: u.fat_abr||0, fatMar: u.fat_mar||0,
    metaJun: u.meta_jun||0, inaug: u.inaug,
    daysActive: days, monthsActive: Math.floor(days/30),
    group, avgTri, roiAccum, paybackLeft,
    daysInBercario, isRepasse, bercStart, metaProgress,
    investment: INVESTMENT,
    franchiseeName: u.franchise_name || u.responsavel_op || "",
    whatsapp: u.whatsapp || u.telefone_atendimento || "",
    responsible: u.responsible || "Ivanise",
    responsavelOp: u.responsavel_op || "", cnpj: u.cnpj || "",
    razaoSocial: u.razao_social || "", endereco: u.endereco || "",
    telefonePessoal: u.telefone_pessoal || "", telefoneAtendimento: u.telefone_atendimento || "",
    email: u.email || "", dataInauguracao: u.data_inauguracao || u.inaug || "",
    dataCadastro: u.data_cadastro || "",
    statusUnidade: u.status_unidade || "",
    lastContactDate: lastMeeting?.data || null,
    lastContactType: lastMeeting?.tipo || null,
    contacts: unitMeetings.map(m => ({
      id: m.id, date: m.data, tipo: m.tipo, responsavel: m.responsavel,
      franqueado: m.franqueado, resumo: m.resumo,
      docLink: `https://docs.google.com/document/d/${m.docId}/edit`,
      gravacaoLink: m.gravacao || null, isRede: m.unidade === "REDE",
    })),
    tasks, notes: u.notes || "",
    diario: [],
  };
});

// Fallback: build from hardcoded data if DB unavailable
export const buildUnits = () => RAW_UNITS.map(([name, fatMai, metaJun, inaug, fatMar, fatAbr], idx) => {
  const days = daysSince(inaug);
  const group = getGroup(fatMai, inaug, name);
  const avgTri = (fatMar + fatAbr + fatMai) / 3;
  const bercStart = REPASSE_BERCARIO[name] || inaug;
  const bercDaysUsed = daysSince(bercStart);
  const daysInBercario = group === "BERÇÁRIO" ? 120 - bercDaysUsed : null;
  const isRepasse = !!REPASSE_BERCARIO[name];
  const totalEstFat = avgTri * Math.floor(days / 30);
  const roiAccum = Math.min(Math.round((totalEstFat / INVESTMENT) * 100), 999);
  const paybackLeft = avgTri > 0 ? Math.max(0, Math.round((INVESTMENT - totalEstFat) / avgTri)) : null;
  const metaProgress = metaJun > 0 ? Math.round((fatMai / metaJun) * 100) : 0;
  const unitMeetings = MEETINGS_DATA.filter(m =>
    m.unidade === name || (m.extra || []).includes(name)
  );
  const lastMeeting = unitMeetings.sort((a,b) => b.data.localeCompare(a.data))[0];
  const tasks = unitMeetings.flatMap(m =>
    (m.tarefas || []).map((t, ti) => ({
      id: `${m.id}_t${ti}`, meetingId: m.id, meetingData: m.data,
      titulo: t.titulo, responsavel: t.resp, prioridade: t.prioridade,
      status: "nao_iniciado", dataConclusao: null, observacao: "",
    }))
  );
  return {
    id: idx + 1, name, fatMai, fatAbr, fatMar, metaJun, inaug,
    daysActive: days, monthsActive: Math.floor(days/30),
    group, avgTri, roiAccum, paybackLeft,
    daysInBercario, isRepasse, bercStart, metaProgress,
    investment: INVESTMENT, franchiseeName: "", whatsapp: "",
    responsible: "Ivanise",
    lastContactDate: lastMeeting?.data || null,
    lastContactType: lastMeeting?.tipo || null,
    contacts: unitMeetings.map(m => ({
      id: m.id, date: m.data, tipo: m.tipo, responsavel: m.responsavel,
      franqueado: m.franqueado, resumo: m.resumo,
      docLink: `https://docs.google.com/document/d/${m.docId}/edit`,
      gravacaoLink: m.gravacao || null, isRede: m.unidade === "REDE",
    })),
    tasks, notes: "", diario: [],
  };
});

// Mescla dados cadastrais do seed (Google Sheets) nas unidades, por nome normalizado
function normName(s){ return (s||"").toUpperCase().replace(/[^A-Z0-9]/g,""); }

export function mergeSeedCadastro(units){
  const byNorm = {};
  units.forEach(u=>{ byNorm[normName(u.name)] = u; });
  const out = units.map(u=>({...u}));
  SEED_CADASTRO.forEach(s=>{
    const key = normName(s.name);
    // tenta casar por contém (ex: "PR - TOLEDO" vs seed "PR - TOLEDO")
    let match = out.find(u=>normName(u.name)===key);
    if(!match) match = out.find(u=>normName(u.name).includes(normName(s.name.split(" - ").pop())) && u.name.slice(0,2)===s.name.slice(0,2));
    if(match){
      match.responsavelOp = match.responsavelOp || s.responsavelOp;
      match.cpf = match.cpf || s.cpf;
      match.cnpj = match.cnpj || s.cnpj;
      match.razaoSocial = match.razaoSocial || s.razaoSocial;
      match.endereco = match.endereco || s.endereco;
      match.cep = match.cep || s.cep;
      match.telefonePessoal = match.telefonePessoal || s.telefonePessoal;
      match.telefoneAtendimento = match.telefoneAtendimento || s.telefoneAtendimento;
      match.email = match.email || s.email;
      match.dataInauguracao = match.dataInauguracao || s.dataInauguracao;
      match.franchiseeName = match.franchiseeName || s.responsavelOp;
      if(!match.statusUnidade) match.statusUnidade = s.statusUnidade;
    } else {
      // Cadastro-only: cria entrada mínima para aparecer no Cadastro de unidades
      out.push({
        id: "seed_"+key, name: s.name, ...s,
        franchiseeName: s.responsavelOp, responsible: "",
        contacts: [], tasks: [], fatMai:0, fatAbr:0, fatMar:0, metaJun:0, metaProgress:0,
        group: (s.statusUnidade||"g3").toUpperCase(), inaug: s.dataInauguracao,
        cadastroOnly: true,
      });
    }
  });
  return out;
}
