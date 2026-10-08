import { REPASSE_BERCARIO } from "../data/repasse";
import { C, TODAY } from "./constants";

// ─── HELPERS ─────────────────────────────────────────────────
export const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);
export const fmtBRL = (n) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n||0);
export const fmtDate = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };

export function getGroup(fat, inaug, name) {
  if (REPASSE_BERCARIO[name] && daysSince(REPASSE_BERCARIO[name]) < 120) return "BERÇÁRIO";
  if (daysSince(inaug) < 120) return "BERÇÁRIO";
  if (fat >= 8000) return "G1";
  if (fat >= 4700) return "G2";
  if (fat >= 3500) return "G3";
  return "G4";
}

export const GROUP_CFG = {
  "BERÇÁRIO": { color: C.bercario, bg: "#f0ebff", label: "🐣 Berçário", freq: 2, freqLabel: "Diário" },
  G1: { color: C.laranja, bg: "#fff3e6", label: "🏆 G1 Líder", freq: 35, freqLabel: "Mensal" },
  G2: { color: C.verde, bg: "#e8f5ee", label: "🔥 G2 Aceleração", freq: 35, freqLabel: "Mensal" },
  G3: { color: C.azul, bg: "#eaeffa", label: "📈 G3 Potencial", freq: 10, freqLabel: "Semanal" },
  G4: { color: C.red, bg: "#fdecea", label: "⚠️ G4 Crítica", freq: 10, freqLabel: "Semanal" },
};

export const STATUS_TASK = {
  "nao_iniciado": { label: "Não iniciado", color: C.textMuted, dot: "○" },
  "em_andamento": { label: "Em andamento", color: C.azul, dot: "◑" },
  "concluido": { label: "Concluído", color: C.verde, dot: "●" },
  "pendente": { label: "Pendente", color: C.amareloTxt, dot: "◐" },
  "cancelado": { label: "Cancelado", color: C.textMuted, dot: "—" },
};

export const STATUS_MANUT = {
  "aguardando_orcamento": { label: "Aguardando orçamento", color: C.amareloTxt },
  "orcamento_enviado": { label: "Orçamento enviado", color: C.azul },
  "aguardando_aprovacao": { label: "Aguardando aprovação", color: C.amareloTxt },
  "aprovado": { label: "Aprovado", color: C.verde },
  "aguardando_peca": { label: "Aguardando peça/envio", color: C.laranja },
  "em_manutencao": { label: "Em manutenção", color: C.laranja },
  "pronto": { label: "Pronto para retornar", color: C.verde },
  "retornou": { label: "Retornou ao estoque", color: C.textMuted },
};

export function genUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c==="x"?r:(r&0x3|0x8); return v.toString(16);
  });
}
