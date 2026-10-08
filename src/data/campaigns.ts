// ─── CAMPAIGN DEFINITIONS ────────────────────────────────────
export const CAMPAIGNS_DATA = [
  {
    id: "copa_junho",
    nome: "🏆 Torcida CK — Copa",
    cor: "#f59e0b",
    corBg: "#fff8e1",
    periodo: "01 a 21/jun",
    dataDisponibilizacao: "2026-06-01",
    tema: "Copa do Mundo",
    descricao: "Kit Torcedor em todo aluguel, bolão nos dias de jogo, +dias grátis por resultado, figurinha premiada.",
    regioes: "todas",
    itensObrigatorios: [
      { id: "kit_torcedor", label: "Kit Torcedor sendo entregue em todos os aluguéis" },
      { id: "bolao_placar", label: "Bolão de placar publicado nos dias de jogo (13/jun, 19/jun, 24/jun)" },
      { id: "dias_gratis", label: "Comunicou +dias grátis por resultado do Brasil aos clientes ativos" },
      { id: "foto_torcendo", label: "Campanha foto torcendo com família (+3 dias se marcar a unidade)" },
      { id: "figurinha", label: "Figurinha premiada sendo enviada nos aluguéis" },
      { id: "stories_diarios", label: "Stories diários com brinquedos disponíveis e Kit Torcedor" },
      { id: "linguagem_ok", label: "Usando linguagem correta (NÃO usa 'Copa do Mundo' / 'FIFA' / 'Seleção')" },
      { id: "reels_copa", label: "Publicando os Reels da campanha da rede" },
    ],
    observacao: "⚠️ Linguagem obrigatória: 'os jogos', 'noite de jogo', 'enquanto o Brasil joga'. NUNCA: Copa do Mundo, FIFA, Seleção Brasileira, Mundial 2026.",
    jogos: [
      { data: "13/jun", descricao: "Brasil x Marrocos 19h", semana: 2 },
      { data: "19/jun", descricao: "Brasil x Haiti 22h", semana: 3 },
      { data: "24/jun", descricao: "Brasil x Escócia 19h", semana: 4 },
    ],
  },
  {
    id: "sao_joao_ne",
    nome: "🟠 São João — Nordeste",
    cor: "#f97316",
    corBg: "#fff3e6",
    periodo: "22 a 30/jun",
    dataDisponibilizacao: "2026-06-19",
    tema: "Festa Junina / Arraial",
    descricao: "Arraial em casa, família reunida, feriado 24/jun. Brinquedos para a semana junina.",
    regioes: "NE",
    itensObrigatorios: [
      { id: "posts_sj", label: "Posts com tema arraial / festa junina publicados" },
      { id: "kit_arraial", label: "Divulgando Kit Arraial em Casa com brinquedos temáticos" },
      { id: "protocolo_jogo_24", label: "Executou protocolo de jogo 24/jun (São João + Brasil x Escócia)" },
      { id: "stories_sj", label: "Stories sobre São João + brinquedos indoor no feriado" },
    ],
  },
  {
    id: "inverno_br",
    nome: "🔵 Inverno — Restante do Brasil",
    cor: "#6e81bf",
    corBg: "#eaeffa",
    periodo: "22 a 30/jun",
    dataDisponibilizacao: "2026-06-19",
    tema: "Frio / Criança em casa",
    descricao: "Frio + criança em casa + energia infinita. Brinquedos indoor, pré-férias julho.",
    regioes: "SUL_SUDESTE_CO_N",
    itensObrigatorios: [
      { id: "posts_inverno", label: "Posts com tema frio / indoor / criança em casa publicados" },
      { id: "pre_ferias", label: "Conteúdo de pré-férias e antecipação de julho publicado" },
      { id: "protocolo_jogo_24_br", label: "Executou protocolo de jogo 24/jun (Brasil x Escócia)" },
      { id: "stories_inverno", label: "Stories com brinquedos para dias frios em casa" },
    ],
  },
  {
    id: "ferias_julho",
    nome: "☀️ Férias Escolares — Julho",
    cor: "#6ece87",
    corBg: "#e8f5ee",
    periodo: "24 a 30/jun",
    dataDisponibilizacao: "2026-06-22",
    tema: "Férias / Julho",
    descricao: "Férias escolares começando 24/jun. Reservas antecipadas, lista de espera, brinquedos para julho.",
    regioes: "todas",
    itensObrigatorios: [
      { id: "cta_reserva", label: "CTA de reserva antecipada para julho publicado" },
      { id: "lista_espera", label: "Criou lista de reserva para brinquedos mais procurados" },
      { id: "posts_ferias", label: "Conteúdo de férias + diversão em casa publicado" },
      { id: "urgencia_ferias", label: "Stories de urgência 'Férias chegando!' com CTA WhatsApp" },
    ],
  },
];

// Nordeste states
const NE_STATES = ["AL","BA","CE","MA","PB","PE","PI","RN","SE"];

export function getCampanhasForUnit(unitName) {
  const estado = unitName.split(" - ")[0];
  const isNE = NE_STATES.includes(estado);
  const camps = ["copa_junho"];
  if (isNE) camps.push("sao_joao_ne");
  else camps.push("inverno_br");
  camps.push("ferias_julho");
  return camps;
}

// Build units from Supabase data
