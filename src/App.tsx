import { useState, useMemo, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────────────────
const SUPABASE_URL = "https://bqspprdmvludxeokcyjp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxc3BwcmRtdmx1ZHhlb2tjeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTkzMzgsImV4cCI6MjA5NjQzNTMzOH0.AgaMkfIgX4yB5rQ7M-Em5DG3_ONZAQwtKRQd_rz3utY";

const sb = {
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  },

  async get(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers: sb.headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: sb.headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(table, id, data, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "PATCH", headers: sb.headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async upsert(table, data, onConflict = "") {
    const url = `${SUPABASE_URL}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ""}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...sb.headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(table, id, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "DELETE", headers: sb.headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },
};

// ─── PALETTE ────────────────────────────────────────────────
const C = {
  laranja: "#f19134", rosa: "#fcccdc", azul: "#6e81bf",
  verde: "#6ece87", amarelo: "#f9d856", bercario: "#a78bfa",
  bg: "#0d0f18", card: "#161925", cardBorder: "#1e2235",
  cardHover: "#1c2030", textPrimary: "#eef0f6", textMuted: "#6b7280",
  red: "#ef4444", redBg: "#2a0f0f",
};

const TODAY = new Date("2026-06-03");
const INVESTMENT = 60000;

// ─── REPASSE BERÇÁRIO ────────────────────────────────────────
const REPASSE_BERCARIO = {
  "SP - SANTOS PRAIA GRANDE": "2026-06-01",
  "CE - JUAZEIRO DO NORTE": "2026-05-24",
};

// ─── MEETINGS DATA ───────────────────────────────────────────
const MEETINGS_DATA = [
  {
    id: "m1", data: "2026-01-13", unidade: "PR - TOLEDO",
    extra: ["BA - BARREIRAS", "MG - ITUIUTABA"],
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Thiago Dalmaso, Helen, Regiane (Ituiutaba), Fernanda (Barreiras)",
    docId: "1N4QhnLF3mN_7ByXLi2yQ6xBCYL31jpKoIKmSxPJFcsI",
    resumo: "Pré-inauguração Toledo, Barreiras e Ituiutaba. Alinhamento dos 3 pilares (Operação, Vendas, Gestão), técnicas de venda consultiva, suporte nos primeiros 90 dias.",
    tarefas: [
      { titulo: "Acompanhar início operacional das 3 novas unidades", resp: "Ivanise", prioridade: "Alta" },
    ],
  },
  {
    id: "m2", data: "2026-01-15", unidade: "SP - SANTO ANDRÉ E SÃO CAETANO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Tamires Zanellato Brito",
    docId: "1kQn7-VvRIO-puAk9jFGz-zxiO-9oPfZ25XXW8ifbAjc",
    resumo: "Análise tráfego pago (ticket R$155,90). Campanha cashback 20% jan-fev. Meta: superar recorde R$4.400 de outubro.",
    tarefas: [
      { titulo: "Lançar campanha cashback 20% (20/jan–20/fev)", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Reativar parceiras em janeiro/fevereiro", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m3", data: "2026-02-11", unidade: "PR - TOLEDO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Thiago Dalmaso",
    docId: "1E1kcdb38otf0Gr46jOiKfQz8t-6bTA7jT7oZB_gxxk0",
    gravacao: "https://drive.google.com/file/d/1AfqZ2esTBHTBb6YL6jbGTol5hL3fdjoOAF2t8Q/view",
    resumo: "Balanço 1º mês positivo. Mamaru com alta demanda (3ª locação seguida). Estratégia jumper com influencer. Recomendação de berço portátil para viajantes.",
    tarefas: [
      { titulo: "Enviar jumper para influencer e registrar como 'alugado' no sistema", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Adquirir berço portátil para atender demanda de viajantes", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m4", data: "2026-04-17", unidade: "MG - CATAGUASES",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Ruth Rocha",
    docId: "1pplwqH0Dwyc-BzW3QXxxeMqnxyiGJQqCTVoM8bsptIs",
    gravacao: "https://drive.google.com/file/d/1BrI99D4liuDiUJ0b9ofQeqkm7-1ykCk/view",
    resumo: "Ajuste campanhas tráfego pago — foco em gestantes e 0-12 meses. Novo criativo educativo mais eficaz. Avaliação de compra de mais 1 Mamaru.",
    tarefas: [
      { titulo: "Enviar vídeos de ideias de conteúdo para Ruth", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Verificar novos produtos para 3-5 meses com Mari", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar lista itens recomendados + cercado menor", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Informar Ruth sobre novo fornecedor", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Revisar prints campanha enviados por Ruth", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Focar campanhas em Mamaru / gestantes 0-12m", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Avaliar compra de mais 1 Mamaru", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Enviar prints da campanha ativa para Ivanise", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m5", data: "2026-04-23", unidade: "PE - RECIFE 1 IMBIRIBEIRA",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Micheli Santos",
    docId: "11L1CiyYbOKSZNgZIEkOKKR8vrp-6rRrVivWbhsgialo",
    gravacao: "https://drive.google.com/file/d/1OL3hLoJOdDTYg36HNXRuCcUxqUrHOVnq/view",
    resumo: "6 parceiras ativas gerando resultados. Novo critério: foco em produção de conteúdo vs. nº de seguidores. Reels com maior alcance. Ajuste para 5-7 stories/dia.",
    tarefas: [
      { titulo: "Analisar stories e orientar sobre engajamento qualificado", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Testar nova frequência de 5-7 stories/dia", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Inibir itens alugados no app em vez de ajuste manual de estoque", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Implementar aumento de R$10 na extratora hands-free e monitorar reação", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m6", data: "2026-05-05", unidade: "RS - TORRES",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Michele Cogo",
    docId: "1iS1Tr0wC3Srv1_wW36HgMJRbCGUk4gXachTBl9jFjVc",
    resumo: "Reestruturação completa: prospecção ativa, parcerias locais, autoridade digital. Meta: 6 novas parcerias, 10 prospecções/dia.",
    tarefas: [
      { titulo: "Enviar editorial + cronograma + roteiros Instagram", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar passo a passo Status WhatsApp", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Contatar Luu_kuhn e Vem pra Torres para parcerias de permuta", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Verificar modelos alternativos de assentos com fornecedores", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Passar contato da Estela para resolver pendência Bum Bag Criativa", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Produzir 2 vídeos semanais seguindo roteiros estratégicos", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Configurar catálogo WhatsApp com fotos humanizadas e sem preços fixos", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Status WhatsApp 2x/dia", resp: "Franqueado", prioridade: "Média" },
      { titulo: "10 prospecções diárias (5 Instagram + 5 networking)", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Fechar 6 novas parcerias estratégicas", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m7", data: "2026-05-06", unidade: "CE - FORTALEZA FÁTIMA",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "David Dias",
    docId: "1egtf3NBFg7-GI-UTaXiSp3xT7Umb1g3yPGsia1Z2-mE",
    resumo: "Alinhamento operacional completo. Fluxo WhatsApp, pós-venda estruturado, campanhas sazonais, Instagram. Equipe: Júlia (WPP), Eduana (sistema), Bruno (prospecção).",
    tarefas: [
      { titulo: "Adicionar Júlia, Eduana e Bruno no grupo de suporte da unidade", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Adicionar equipe no grupo de manutenção da rede", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Definir fluxo operacional campanhas com dias extras de aluguel", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Compartilhar acesso da pasta Drive da unidade Fortaleza", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar manual + cronograma de conteúdo Instagram", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar material fluxo pós-venda obrigatório", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Monitorar aniversariantes diariamente no sistema", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Atualizar corretamente motivos de manutenção no sistema", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Pesquisar brinquedos antes de cada contato de renovação", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m8", data: "2026-05-12", unidade: "MG - UBERLÂNDIA",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "ClubKids Uberlândia",
    docId: "1v4HJTfS26OTWM6ZuRYgq7Sh0AQYNVFdepvF8ASeCQ-s",
    gravacao: "https://drive.google.com/file/d/163C5z5XQlQry9kktWNK6FjFxzFhk6bIg/view",
    resumo: "Implementação CRM Scale (WhatsApp). Reativação de inativos e prospecção Instagram. Parcerias hotéis e Airbnb. Automação mensagens de renovação.",
    tarefas: [
      { titulo: "Enviar cronograma conteúdo junho + link ferramenta de automação", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar tutorial prospecção ativa Instagram", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Agendar treinamento Web WhatsApp", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Programar Instagram semanal", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Configurar respostas rápidas + chave Pix WhatsApp Business", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Cobrar gerente de hotel sobre proposta de parceria", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Prospectar 3 hotéis/pousadas para parcerias", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Configurar Web WhatsApp para atendimento ágil", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Exportar planilha clientes mensalmente para ações com IA", resp: "Franqueado", prioridade: "Média" },
      { titulo: "10 contatos diários de prospecção no Instagram", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m9", data: "2026-05-13", unidade: "PR - TOLEDO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Thiago Dalmaso",
    docId: "1QfXE1Onvhk1Rsfd2UY1UWyeWh6u72Zn7u29UmISZU14",
    resumo: "Foco em conversão: etiquetas WhatsApp, follow-up diário, substituição de desconto por valor agregado (dias extras), 10 prospecções/dia Instagram.",
    tarefas: [
      { titulo: "Analisar histórico conversas sincronizadas Toledo", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Avaliar situação clientes de Cascavel e estratégias recuperação", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar arte com QR Code para parcerias presenciais", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar sugestões temas conteúdo regionalizado Toledo", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Revisar abordagem clientes esquecidos da base Toledo", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Criar etiquetas WhatsApp (Em atend./Aguardando/Pós-venda/Renovação)", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Stories sobre disponibilidade cadeira Mamaru", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Follow-up diário dos leads classificados nas etiquetas", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "10 prospecções diárias Instagram", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Estratégia valor agregado: dias extras de aluguel em vez de desconto", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m10", data: "2026-05-15", unidade: "SP - OSASCO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Andressa Máximo",
    docId: "1IBnbmFW5Udx3RvuGoDC4CBPIEI4NVgQDs9N5BL0i7-o",
    resumo: "Revisão estratégica: jumpers via influenciadoras gerando ótimo resultado. Pausa tráfego pago para fortalecer orgânico (mentoria Jamile Passo). Reativação RFV.",
    tarefas: [
      { titulo: "Enviar análise completa do perfil Instagram Osasco", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar sugestões temas stories + roteiros séries educacionais", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar material editorial de posts para a rede", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Enviar tutorial RFV no sistema de gestão", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Adicionar geolocalização cidade/bairros em posts, Reels e stories", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Incluir CTAs incentivando compartilhamento via direct", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Baixar planilha RFV e abordar clientes por segmento", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m11", data: "2026-05-21", unidade: "SC - JARAGUÁ DO SUL",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Fabrício Alves + Amanda Galli",
    docId: "12L8nhsPH-ZxKPwHFMrRNHxHonx-Gkm_AEUe5LbAw9_I",
    gravacao: "https://drive.google.com/file/d/1yASlSp4WjvEh8taYFnEJfR6vIuKje-3r/view",
    resumo: "Crescimento sustentado. Tráfego pago R$50-55/sem (2.600→3.000 seguidores). Campanha Dia das Mães 40% foi bem-sucedida. Foco em segmentação RFV e microinfluenciadores.",
    tarefas: [
      { titulo: "Enviar formulário preparatório antes da próxima reunião Jaraguá", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Verificar divergência de faturamento no dashboard do sistema", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar sugestões de temas e ganchos para criação de conteúdo", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Testar Google Ads por 1 semana e avaliar impacto", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Elevar para 5-7 stories/dia com geolocalização e ganchos fortes", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Segmentar contatos via RFV para identificar inativos", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Buscar microinfluenciadores ~4k seguidores + verificar localização nos perfis", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m12", data: "2026-05-25", unidade: "REDE",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Luiz Maskow (convidado especial)",
    docId: "1BIUfPy8gaazphBWL__8aBr2w9CKNM2UGx6ExFUrZd7I",
    gravacao: "https://drive.google.com/file/d/1VRAVGsMl5-PcG2xprs4kuF1eiEt5X716/view",
    resumo: "Conexão CK Maio/2026 — Instagram que vende. Funil atração/relacionamento/conversão. Reels priorizados. Anúncios segmentados + atendimento humanizado.",
    tarefas: [
      { titulo: "Compartilhar material de reaproveitamento de conteúdos com o grupo", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Disponibilizar ata na universidade corporativa", resp: "Ivanise", prioridade: "Média" },
    ],
  },
];

// ─── JP MAINTENANCE DATA ─────────────────────────────────────
const JP_MANUTENCAO_INICIAL = [
  "Assento Multifuncional 3 Estágios - INFANTINO","Mini Berço Baby Hug 4 em 1 - CHICCO",
  "Centro de Atividades Around We Go - BRIGHT STARTS","Centro de Atividades Bounce Baby Sapinho - BRIGHT STARTS",
  "Cercado Animado - FIRST STEPS","Lousa Infantil 2 em 1 com Cadeirinha - LOUSA KIDS",
  "Cadeira Basculante Elefantinho - MASTELA","Cadeira Basculante Elefantinho - MASTELA",
  "Centro de Atividades - INFANTINO","Monitor Cardíaco Fetal Pocket - DOPPLER",
  "Babá Eletrônica - CLINGO","Cercado Animado - FIRST STEPS",
  "Assento Selva - INFANTINO","Centro Step N Play Piano - FISHER PRICE",
  "Apoiador Passeio e Descoberta - VTECH","Escorregador cachorrinho com balanço - ALPHA",
  "Centro de Atividades Explore & More - SKIP HOP","Cercado Animado - FIRST STEPS",
  "Jumperoo Viagem e Descoberta - BABY EINSTEIN","Centro de Atividades Around We Go - BRIGHT STARTS",
  "Gangorra Infantil Pikler - BEBRINQUÊ","Carrinho de Passeio Pocket - GB",
  "Jumperoo Pink Petals - FISHER PRICE","Jardim de Atividades - LITTLE TIKES",
  "Moto King Rider Elétrica 12V Preta - BANDEIRANTE","Carrinho de Passeio Delta - VOYAGE",
  "Trave Dupla - XALINGO","Jardim de Atividades - LITTLE TIKES",
  "Triciclo Smart Plus - BANDEIRANTE","Jeep Wrangler Elétrico 12V Laranja - BANDEIRANTE",
  "Escorregador Splash 3 Degraus - BANDEIRANTE","Carrinho Jipe Rosa - CALESITA",
  "Jumperoo Tiger Time - FISHER PRICE","Caminhão Brutus Construtor Pedal - BANDEIRANTE",
  "Cercado Dino - LE PETIT","Maserati Elétrica 12V Azul Com Controle - BANDEIRANTE",
  "Carrinho Smart Banjipe Passeio e Pedal Camuflado - BANDEIRANTE","Cercado Animado - FIRST STEPS",
  "Cercado Animado - FIRST STEPS","Cercado Animado - FIRST STEPS",
  "Jaguar Elétrico 12V Branco - BANDEIRANTE","Super Banjipe - Reclinável com Capota - Preto - BANDEIRANTE",
  "Super Banjipe - Reclinável com Capota - Preto - BANDEIRANTE","Cadeira Vibratória Coelhinho - INGENUITY",
  "Massageador de Seios + Aquecedores - FRIDA MOM","Mesa de Atividades Laugh & Learn - FISHER PRICE",
  "Bomba Extratora Swing Maxi Dupla - MEDELA","Cama Elástica Quadrada - TOIN TOIN",
  "Assento de Alimentação Luv U Zoo - FISHER PRICE","Playground Infantil Dupla Diversão - LITTLE TIKES",
  "Mercedes Titanium Elétrica 12V - BANDEIRANTE","Bomba Extratora Swing Dupla - MEDELA",
  "Apoiador Ferramenta - JANOD","Berço Hello Cinza - INFANTI",
  "Jumper Joyful Centro de Atividades 360° - INFANTI","Cama Elástica Quadrada - TOIN TOIN",
  "Cadeira Basculante Elefantinho - MASTELA","Berço Hello Cinza - INFANTI",
  "Centro Step N Play Piano - FISHER PRICE","Piscina de Bolinhas - LACUCA",
  "Berço Hello Cinza - INFANTI","Quadriciclo Elétrico 12V Vermelho - BANDEIRANTE",
  "Tapete Piano - BABY EINSTEIN","Kart Elétrico - BANDEIRANTE",
  "Berço Desmontável Azul - INFANTI","Assento Bumbo Multi - Azul - BUMBO",
  "Cama Elástica Quadrada - TOIN TOIN","Cadeira Moisés Multi-Motion - MASTELA",
  "Cercado Animado - FIRST STEPS","Vespa Branca 12V - BANDEIRANTE",
  "Audi RS Q E-Tron Elétrico Grafite 24V - BANDEIRANTE","Lambreta Elétrica 6V Hello Kitty - BANDEIRANTE",
  "Monitor Cardíaco Fetal Pocket - DOPPLER","Carrinho de Passeio - ABC DESIGN",
  "Assento Sit Me Up Sapinho Azul - FISHER PRICE","Cadeira Basculante Sorvete - MASTELA",
  "Jumperoo Tiger Time - FISHER PRICE","Babá Eletrônica - CLINGO",
  "Cadeira Vibratória Bichinhos Animados - FISHER PRICE","Assento azul com Bandeja - BUMBO",
  "Berço Desmontável Toybar Rosa - COSCO","Monitor Cardíaco Fetal - DOPPLER",
  "Cadeira de Balanço New Mamaroo 5.0 Gray - 4MOMS",
].map((nome, i) => ({
  id: i + 1, nome, status: "aguardando_orcamento",
  dataEntrada: null, motivo: "", orcamentoValor: "", orcamentoLink: "",
  aprovacao: "pendente", dataAprovacao: null,
  dataEnvio: null, dataChegada: null, dataManutencao: null, dataRetorno: null,
  enviadoPara: [], responsavel: "Will", observacoes: "",
}));

// ─── UNITS DATA ───────────────────────────────────────────────
const RAW_UNITS = [
  ["PB - JOÃO PESSOA",27494.95,40000,"2015-05-11",29647.07,24750.72],
  ["SP - PINHEIROS E BUTANTÃ",5551.60,5000,"2024-02-26",1841.23,1315.01],
  ["SP - VILA ANDRADE E CENTRO",3006.24,3500,"2024-01-12",2288.43,3052.95],
  ["AC - RIO BRANCO",6618.34,7500,"2020-08-24",7588.70,6942.28],
  ["AL - ARAPIRACA",639.10,2500,"2026-02-12",0,1725.30],
  ["AP - MACAPÁ",10228.38,11000,"2022-12-16",9079.45,8897.68],
  ["BA - BARREIRAS",2186.80,3500,"2026-01-15",2723.93,2108.29],
  ["BA - FEIRA DE SANTANA",950.60,2500,"2023-12-01",1407.37,1381.65],
  ["BA - ITABUNA",1366.70,2500,"2025-09-26",1940.58,1373.66],
  ["BA - LAURO DE FREITAS",1298.63,2500,"2024-04-27",716.95,571.00],
  ["BA - SALVADOR",1161.94,2500,"2024-02-04",1216.96,529.97],
  ["BA - VITÓRIA DA CONQUISTA",3070.78,4000,"2023-09-06",3819.13,2206.30],
  ["CE - AQUIRAZ E EUSEBIO",2515.52,3500,"2024-05-17",2169.37,3159.83],
  ["CE - FORTALEZA FÁTIMA",1582.50,2500,"2025-03-07",302.72,1426.98],
  ["CE - FORTALEZA MEIRELES",10825.00,10500,"2023-06-17",9501.88,8697.60],
  ["CE - JUAZEIRO DO NORTE",1775.74,2500,"2024-07-15",406.10,1900.58],
  ["ES - VITÓRIA",2565.10,2500,"2024-04-04",1582.76,1437.23],
  ["GO - ANÁPOLIS",1320.80,2500,"2025-03-21",1161.15,939.20],
  ["GO - APARECIDA DE GOIÂNIA",1153.75,2500,"2025-03-21",981.20,930.80],
  ["GO - GOIÂNIA",14852.62,16500,"2021-08-14",14524.11,17136.65],
  ["GO - RIO VERDE",4827.15,5500,"2024-12-19",4393.08,4852.22],
  ["MA - SÃO LUÍS",2892.83,3500,"2024-04-10",2794.70,3724.68],
  ["MG - BH PAMPULHA",6532.60,6500,"2025-10-03",5537.51,7212.13],
  ["MG - BH SAVASSI",1723.58,2000,"2026-01-29",728.32,1474.42],
  ["MG - CATAGUASES",1037.51,2500,"2025-08-29",714.02,388.60],
  ["MG - DIVINÓPOLIS",674.25,2500,"2024-09-14",929.40,565.46],
  ["MG - IPATINGA",2578.61,3500,"2025-07-14",4226.43,3133.97],
  ["MG - ITUIUTABA",3576.18,4500,"2026-01-20",2759.51,3377.32],
  ["MG - JUIZ DE FORA",1141.86,2500,"2025-11-05",1186.49,1700.75],
  ["MG - MANHUAÇU",446.18,2500,"2025-09-12",1617.80,1081.84],
  ["MG - NOVA SERRANA",1194.68,2500,"2025-08-08",1494.10,932.50],
  ["MG - UBERLÂNDIA",1851.05,2500,"2025-03-21",1783.60,1969.10],
  ["MG - VIÇOSA",1791.50,2500,"2025-06-27",1118.50,2459.70],
  ["MS - CAMPO GRANDE",1158.00,2500,"2022-10-29",152.00,0],
  ["MS - DOURADOS",330.00,2500,"2023-10-10",740.00,681.00],
  ["MT - CUIABÁ",3344.25,4000,"2024-10-15",3781.28,5002.77],
  ["MT - RONDONÓPOLIS",2164.25,2500,"2025-05-16",1879.64,2362.40],
  ["PA - BELÉM",9702.96,10500,"2024-05-11",10000.70,9132.08],
  ["PA - ITAITUBA",4419.06,5500,"2024-07-06",6633.15,4079.69],
  ["PB - SOUSA E ALTO SERTÃO",1016.40,2500,"2025-10-30",987.70,855.60],
  ["PB - CAMPINA GRANDE",7231.08,8500,"2018-05-14",8113.75,4408.32],
  ["PB - GUARABIRA E BREJO",149.00,2500,"2023-07-15",486.25,711.51],
  ["PB - PATOS",754.35,2500,"2021-01-25",918.15,1289.27],
  ["PB - SANTA RITA E BAYEUX",778.00,2500,"2023-01-21",515.07,464.15],
  ["PE - JABOATÃO CANDEIAS",452.72,2500,"2025-09-26",149.00,685.60],
  ["PE - GARANHUNS",385.70,2500,"2020-10-01",2163.05,1308.80],
  ["PE - RECIFE 1 IMBIRIBEIRA",4677.54,5500,"2024-12-06",4510.69,5249.58],
  ["PE - RECIFE 2 BOA VIAGEM",2573.70,3500,"2024-05-18",2235.65,1344.50],
  ["PI - TERESINA JÓQUEI",8507.24,9500,"2024-11-15",10614.40,10674.13],
  ["PR - CASCAVEL",13520.79,14500,"2023-06-24",11371.13,12907.09],
  ["PR - CURITIBA AHÚ",9440.40,10500,"2023-09-02",10118.18,10130.18],
  ["PR - CURITIBA BATEL",18206.33,19000,"2023-04-10",17430.72,18090.42],
  ["PR - FOZ DO IGUAÇU",8024.41,8500,"2024-05-04",6314.24,7322.12],
  ["PR - LONDRINA",2688.20,3000,"2024-10-04",2757.14,2526.90],
  ["PR - MARINGÁ",2407.55,2500,"2025-11-24",1074.14,1511.35],
  ["PR - PONTA GROSSA",1856.72,2500,"2026-05-04",0,0],
  ["PR - SÃO JOSÉ DOS PINHAIS",5288.86,6000,"2024-08-15",5337.55,5589.23],
  ["PR - TOLEDO",2121.19,2500,"2026-01-15",1508.73,2217.58],
  ["RJ - NOVA IGUAÇU",0,2500,"2025-07-25",698.08,323.28],
  ["RJ - BARRA DA TIJUCA",2590.00,2500,"2024-07-27",1985.80,1616.32],
  ["RJ - ILHA DO GOVERNADOR",976.50,2500,"2025-08-29",667.19,314.50],
  ["RJ - NITERÓI",2956.06,3500,"2023-08-05",4323.33,2319.37],
  ["RJ - RESENDE",1283.74,2500,"2024-03-30",1168.00,929.24],
  ["RJ - RIO MARACANÃ",297.30,2500,"2026-02-27",938.90,693.94],
  ["RJ - SÃO GONÇALO",338.06,2500,"2025-08-29",396.16,0],
  ["RJ - VOLTA REDONDA",1803.84,2500,"2024-12-02",1037.90,997.50],
  ["RN - MOSSORÓ",3973.93,4500,"2019-05-20",4605.61,4689.69],
  ["RN - NATAL",1654.30,2500,"2018-03-19",2533.98,1635.48],
  ["RO - PORTO VELHO",9544.31,10000,"2025-11-07",7193.24,9305.87],
  ["RR - BOA VISTA",15510.68,16500,"2025-04-01",20884.38,18030.69],
  ["RS - PELOTAS",406.00,2500,"2025-05-30",606.04,947.13],
  ["RS - IJUÍ",1517.16,2500,"2026-01-29",1419.75,2328.72],
  ["RS - TORRES",134.25,2500,"2025-12-22",0,179.00],
  ["SC - BLUMENAU",3464.16,4000,"2024-06-01",3163.54,3493.87],
  ["SC - CHAPECÓ",8034.46,9000,"2024-12-06",8105.57,10284.16],
  ["SC - JARAGUÁ DO SUL",3307.85,4500,"2025-04-03",4859.34,5445.62],
  ["SC - JOINVILLE",3579.56,4500,"2024-10-10",5347.35,4623.04],
  ["SC - SÃO JOSÉ PALHOÇA",2775.60,3500,"2024-11-22",3353.40,4101.18],
  ["SE - ARACAJU",1816.93,3000,"2024-11-15",3672.28,3283.65],
  ["SP - PINDAMONHANGABA",146.30,2500,"2025-07-14",173.80,473.90],
  ["SP - IPIRANGA E MOOCA",2861.74,3000,"2025-03-21",1583.50,1852.80],
  ["SP - GUARULHOS CECAP",958.16,2500,"2025-08-29",289.00,819.94],
  ["SP - AMERICANA",3887.39,4500,"2025-10-31",2350.46,2711.24],
  ["SP - ARARAQUARA",3540.50,4000,"2023-11-01",2875.25,2995.00],
  ["SP - BARUERI E SANTANA",6684.40,5000,"2024-04-15",8063.05,8335.33],
  ["SP - CAMPINAS CAMBUÍ",1711.87,2500,"2025-03-21",2454.11,2987.74],
  ["SP - INDAIATUBA",1528.78,2500,"2025-08-08",2715.48,968.90],
  ["SP - JAÚ",538.34,2500,"2025-01-24",941.59,1106.77],
  ["SP - MARÍLIA",1503.30,2500,"2024-04-04",1185.90,1727.20],
  ["SP - MOGI DAS CRUZES",1999.78,2500,"2024-07-15",861.30,1838.23],
  ["SP - OSASCO",2661.54,3000,"2025-11-15",1734.25,1761.94],
  ["SP - PAULÍNIA",699.97,2500,"2025-07-11",663.56,770.24],
  ["SP - PIRACICABA",274.00,2500,"2024-12-19",826.88,383.30],
  ["SP - RIBEIRÃO PRETO",1187.00,2500,"2025-05-19",1355.46,2357.02],
  ["SP - SANTO ANDRÉ E SÃO CAETANO",2403.14,3000,"2024-07-06",3300.95,2929.58],
  ["SP - SANTOS PRAIA GRANDE",9583.88,10500,"2024-02-01",11227.10,9844.38],
  ["SP - SÃO JOSÉ DOS CAMPOS",3416.30,4000,"2022-10-05",6009.05,3725.60],
  ["SP - SOROCABA VOTORANTIM",624.45,2500,"2024-08-01",669.71,485.15],
  ["TO - ARAGUAÍNA",3966.90,4500,"2023-03-31",4807.60,3379.40],
  ["TO - PALMAS",4484.14,5500,"2024-05-18",6259.00,5220.78],
];

// ─── HELPERS ─────────────────────────────────────────────────
const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);
const fmtBRL = (n) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n||0);
const fmtDate = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
const fmtDateShort = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}`; };

function getGroup(fat, inaug, name) {
  if (REPASSE_BERCARIO[name] && daysSince(REPASSE_BERCARIO[name]) < 120) return "BERÇÁRIO";
  if (daysSince(inaug) < 120) return "BERÇÁRIO";
  if (fat >= 8000) return "G1";
  if (fat >= 4700) return "G2";
  if (fat >= 3500) return "G3";
  return "G4";
}

const GROUP_CFG = {
  "BERÇÁRIO": { color: C.bercario, bg: "#1e1a2e", label: "🐣 Berçário", freq: 2, freqLabel: "Diário" },
  G1: { color: C.laranja, bg: "#2a1a08", label: "🏆 G1 Líder", freq: 35, freqLabel: "Mensal" },
  G2: { color: C.verde, bg: "#0a2015", label: "🔥 G2 Aceleração", freq: 35, freqLabel: "Mensal" },
  G3: { color: C.azul, bg: "#0a1528", label: "📈 G3 Potencial", freq: 10, freqLabel: "Semanal" },
  G4: { color: C.red, bg: "#200a0a", label: "⚠️ G4 Crítica", freq: 10, freqLabel: "Semanal" },
};

const STATUS_TASK = {
  "nao_iniciado": { label: "Não iniciado", color: C.textMuted, dot: "○" },
  "em_andamento": { label: "Em andamento", color: C.azul, dot: "◑" },
  "concluido": { label: "Concluído", color: C.verde, dot: "●" },
  "pendente": { label: "Pendente", color: C.amarelo, dot: "◐" },
  "cancelado": { label: "Cancelado", color: C.textMuted, dot: "—" },
};

const STATUS_MANUT = {
  "aguardando_orcamento": { label: "Aguardando orçamento", color: C.amarelo },
  "orcamento_enviado": { label: "Orçamento enviado", color: C.azul },
  "aguardando_aprovacao": { label: "Aguardando aprovação", color: C.amarelo },
  "aprovado": { label: "Aprovado", color: C.verde },
  "aguardando_peca": { label: "Aguardando peça/envio", color: C.laranja },
  "em_manutencao": { label: "Em manutenção", color: C.laranja },
  "pronto": { label: "Pronto para retornar", color: C.verde },
  "retornou": { label: "Retornou ao estoque", color: C.textMuted },
};

// ─── CAMPAIGN DEFINITIONS ────────────────────────────────────
const CAMPAIGNS_DATA = [
  {
    id: "copa_junho",
    nome: "🏆 Torcida CK — Copa",
    cor: "#f59e0b",
    corBg: "#2a1e08",
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
    corBg: "#2a1508",
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
    corBg: "#0a1528",
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
    corBg: "#0a2015",
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

function getCampanhasForUnit(unitName) {
  const estado = unitName.split(" - ")[0];
  const isNE = NE_STATES.includes(estado);
  const camps = ["copa_junho"];
  if (isNE) camps.push("sao_joao_ne");
  else camps.push("inverno_br");
  camps.push("ferias_julho");
  return camps;
}

// Build units from Supabase data
const buildUnitsFromDB = (rows) => rows.map((u) => {
  const days = daysSince(u.inaug);
  const group = getGroup(u.fat_mai, u.inaug, u.name);
  const avgTri = ((u.fat_mar||0) + (u.fat_abr||0) + (u.fat_mai||0)) / 3;
  const bercStart = REPASSE_BERCARIO[u.name] || u.inaug;
  const bercDaysUsed = daysSince(bercStart);
  const daysInBercario = group === "BERÇÁRIO" ? 120 - bercDaysUsed : null;
  const isRepasse = !!REPASSE_BERCARIO[u.name];
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
    franchiseeName: u.franchise_name || "",
    whatsapp: u.whatsapp || "",
    responsible: u.responsible || "Ivanise",
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
const buildUnits = () => RAW_UNITS.map(([name, fatMai, metaJun, inaug, fatMar, fatAbr], idx) => {
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

// ─── SHARED COMPONENTS ───────────────────────────────────────
function Semaphore({ unit }) {
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

function GroupBadge({ group, small }) {
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

function ProgressBar({ pct, color, height=4 }) {
  const c = Math.min(pct,100);
  const col = color || (pct>=100?C.verde:pct>=70?C.amarelo:C.red);
  return (
    <div style={{width:"100%",height,borderRadius:2,background:"#2a2d3d",overflow:"hidden"}}>
      <div style={{width:`${c}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.4s"}} />
    </div>
  );
}

const labelSt = {fontSize:10,color:C.textMuted,display:"block",marginBottom:4,
  textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600};
const inputSt = {width:"100%",padding:"8px 12px",background:"#0a0c14",
  border:`1px solid ${C.cardBorder}`,borderRadius:8,color:C.textPrimary,
  fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
const btnSt = (bg,color="#fff") => ({
  padding:"8px 16px",borderRadius:8,background:bg,border:"none",
  color,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",
});

// ─── TASK ROW ─────────────────────────────────────────────────
function TaskRow({ task, onUpdate, compact }) {
  const sc = STATUS_TASK[task.status];
  const isOverdue = task.status !== "concluido" && task.meetingData &&
    daysSince(task.meetingData) > 14;
  const prioColor = { Alta: C.red, Média: C.amarelo, Baixa: C.textMuted };
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
          background:"#0a0c14", border:`1px solid ${C.cardBorder}`,
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

// ─── UNIT DETAIL PANEL ────────────────────────────────────────
function UnitDetail({ unit, onClose, onUpdate, allMeetings }) {
  const [tab, setTab] = useState("overview");
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newTask, setNewTask] = useState({ titulo:"",responsavel:"Ivanise",prioridade:"Alta",status:"nao_iniciado",observacao:"" });
  const [newContact, setNewContact] = useState({ date:TODAY.toISOString().slice(0,10),tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gravacaoLink:"" });
  const [localUnit, setLocalUnit] = useState(unit);

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
    if(!newTask.titulo.trim()) return;
    updateLocal({
      tasks:[...(localUnit.tasks||[]),{
        ...newTask, id:`manual_${Date.now()}`,
        meetingId:null, meetingData:TODAY.toISOString().slice(0,10),
      }]
    });
    setNewTask({titulo:"",responsavel:"Ivanise",prioridade:"Alta",status:"nao_iniciado",observacao:""});
    setShowNewTask(false);
  }

  function addContact() {
    if(!newContact.resumo.trim()) return;
    const updated = {
      ...localUnit,
      contacts:[{...newContact,id:`c_${Date.now()}`,...(localUnit.contacts||[])?.slice(-99)},...(localUnit.contacts||[])],
      lastContactDate: newContact.date,
      lastContactType: newContact.tipo,
    };
    setLocalUnit(updated);
    onUpdate(updated);
    setNewContact({date:TODAY.toISOString().slice(0,10),tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gravacaoLink:""});
    setShowNewContact(false);
  }

  const TABS = [
    {id:"overview",label:"Visão Geral"},
    {id:"tasks",label:`Tarefas (${openTasks.length}${overdueTasks.length>0?` ⚠️${overdueTasks.length}`:""})`},
    {id:"contacts",label:`Contatos (${(localUnit.contacts||[]).length})`},
    {id:"notes",label:"Notas"},
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",zIndex:500}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(700px,100vw)",height:"100vh",background:C.bg,borderLeft:`1px solid ${C.cardBorder}`,overflowY:"auto",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{padding:"18px 22px 0",borderBottom:`1px solid ${C.cardBorder}`,position:"sticky",top:0,background:C.bg,zIndex:10}}>
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
                  {localUnit.isRepasse&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${C.amarelo}22`,color:C.amarelo,border:`1px solid ${C.amarelo}44`}}>REPASSE</span>}
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
              <div key={s.label} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:9,color:C.textMuted,marginTop:1}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>setShowNewContact(true)} style={btnSt(C.laranja)}>+ Registrar contato</button>
            <button onClick={()=>setShowNewTask(true)} style={btnSt("transparent","#fff")}>+ Nova tarefa</button>
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

          {/* OVERVIEW */}
          {tab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Progress */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>Progresso — Meta Jun/26</div>
                <ProgressBar pct={localUnit.metaProgress} height={6} />
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:10,color:C.textMuted}}>Maio: {fmtBRL(localUnit.fatMai)}</span>
                  <span style={{fontSize:10,color:localUnit.metaProgress>=100?C.verde:C.laranja,fontWeight:700}}>{localUnit.metaProgress}%</span>
                  <span style={{fontSize:10,color:C.textMuted}}>Meta: {fmtBRL(localUnit.metaJun)}</span>
                </div>
              </div>

              {/* Trimester */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:8}}>Histórico trimestral</div>
                <div style={{display:"flex",gap:8}}>
                  {[["Mar/26",localUnit.fatMar],["Abr/26",localUnit.fatAbr],["Mai/26",localUnit.fatMai]].map(([l,v])=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{fmtBRL(v)}</div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{l}</div>
                      <div style={{marginTop:4}}><ProgressBar pct={localUnit.metaJun>0?(v/localUnit.metaJun)*100:0} color={C.azul} /></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[
                  {label:"Investimento",value:fmtBRL(localUnit.investment),color:C.textMuted},
                  {label:"ROI acumulado est.",value:`${localUnit.roiAccum}%`,color:localUnit.roiAccum>=100?C.verde:C.laranja},
                  {label:"Meses p/ payback",value:localUnit.paybackLeft!==null?`~${localUnit.paybackLeft}m`:"—",color:C.azul},
                ].map(s=>(
                  <div key={s.label} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>{s.label}</div>
                    <div style={{fontSize:15,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Pending tasks preview */}
              {openTasks.length>0&&(
                <div style={{background:C.card,border:`1px solid ${overdueTasks.length>0?"#ef444433":C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:11,color:C.textMuted}}>Tarefas em aberto ({openTasks.length}){overdueTasks.length>0&&<span style={{color:C.red}}> · {overdueTasks.length} vencidas</span>}</div>
                    <button onClick={()=>setTab("tasks")} style={{background:"none",border:"none",color:C.azul,fontSize:11,cursor:"pointer"}}>Ver todas →</button>
                  </div>
                  {openTasks.slice(0,4).map(t=>(
                    <TaskRow key={t.id} task={t} onUpdate={updateTask} compact />
                  ))}
                </div>
              )}

              {/* Contact info */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>Contato e responsável</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={labelSt}>Nome do franqueado</label>
                    <input value={localUnit.franchiseeName} onChange={e=>updateLocal({franchiseeName:e.target.value})} placeholder="Nome completo" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>WhatsApp</label>
                    <input value={localUnit.whatsapp} onChange={e=>updateLocal({whatsapp:e.target.value})} placeholder="(XX) XXXXX-XXXX" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Responsável CRM</label>
                    <select value={localUnit.responsible} onChange={e=>updateLocal({responsible:e.target.value})} style={inputSt}>
                      <option>Ivanise</option><option>Will</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Freq. contato</label>
                    <div style={{padding:"8px 12px",background:"#0a0c14",border:`1px solid ${C.cardBorder}`,borderRadius:8,fontSize:13,color:cfg.color,fontWeight:600}}>
                      {cfg.freqLabel}
                    </div>
                  </div>
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
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addTask} style={btnSt(C.azul)}>Criar</button>
                    <button onClick={()=>setShowNewTask(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
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
                        <div style={{padding:"8px 14px",background:"#0a0c14",borderBottom:`1px solid ${C.cardBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addContact} style={btnSt(C.laranja)}>Salvar</button>
                    <button onClick={()=>setShowNewContact(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
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
        </div>
      </div>
    </div>
  );
}

// ─── MAINTENANCE MODULE (JP) ──────────────────────────────────
function MaintenanceModule() {
  const [items, setItems] = useState(JP_MANUTENCAO_INICIAL);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({nome:"",motivo:"",status:"aguardando_orcamento",responsavel:"Will"});

  const filtered = items.filter(i => {
    const ms = i.status !== "retornou";
    const ss = filterStatus==="todos" || i.status===filterStatus;
    const qs = !search || i.nome.toLowerCase().includes(search.toLowerCase());
    return ms && ss && qs;
  });

  const active = items.filter(i=>i.status!=="retornou");
  const byStatus = Object.keys(STATUS_MANUT).reduce((acc,k)=>({...acc,[k]:active.filter(i=>i.status===k).length}),{});

  function updateItem(id, updates) {
    setItems(prev=>prev.map(i=>i.id===id?{...i,...updates}:i));
    if(selected?.id===id) setSelected(s=>({...s,...updates}));
  }

  function addItem() {
    if(!newItem.nome.trim()) return;
    setItems(prev=>[...prev,{...newItem,id:Date.now(),orcamentoLink:"",orcamentoValor:"",aprovacao:"pendente",dataEntrada:TODAY.toISOString().slice(0,10),dataAprovacao:null,dataEnvio:null,dataChegada:null,dataManutencao:null,dataRetorno:null,enviadoPara:[],observacoes:""}]);
    setNewItem({nome:"",motivo:"",status:"aguardando_orcamento",responsavel:"Will"});
    setShowForm(false);
  }

  const FLOW_STEPS = [
    {key:"aguardando_orcamento",label:"Orçamento"},
    {key:"orcamento_enviado",label:"Enviado"},
    {key:"aguardando_aprovacao",label:"Aprovação"},
    {key:"aprovado",label:"Aprovado"},
    {key:"aguardando_peca",label:"Aguard. peça"},
    {key:"em_manutencao",label:"Em manutenção"},
    {key:"pronto",label:"Pronto"},
    {key:"retornou",label:"Retornou"},
  ];

  const stepIdx = (s) => FLOW_STEPS.findIndex(f=>f.key===s);

  return (
    <div style={{padding:"14px 14px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🔧 Manutenção — JP (João Pessoa)</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{active.length} itens ativos · {items.filter(i=>i.status==="retornou").length} retornaram ao estoque</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.laranja)}>+ Novo item</button>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {Object.entries(STATUS_MANUT).filter(([k])=>byStatus[k]>0).map(([k,v])=>(
          <div key={k} style={{background:C.card,border:`1px solid ${v.color}33`,borderRadius:8,padding:"6px 12px",flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:800,color:v.color}}>{byStatus[k]}</div>
            <div style={{fontSize:9,color:C.textMuted,whiteSpace:"nowrap"}}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* New item form */}
      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.laranja}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar item em manutenção</div>
          <input value={newItem.nome} onChange={e=>setNewItem({...newItem,nome:e.target.value})} placeholder="Nome do brinquedo" style={{...inputSt,marginBottom:8}} />
          <textarea value={newItem.motivo} onChange={e=>setNewItem({...newItem,motivo:e.target.value})} placeholder="Motivo / problema identificado" style={{...inputSt,height:60,resize:"vertical",marginBottom:8}} />
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <select value={newItem.status} onChange={e=>setNewItem({...newItem,status:e.target.value})} style={inputSt}>
              {Object.entries(STATUS_MANUT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={newItem.responsavel} onChange={e=>setNewItem({...newItem,responsavel:e.target.value})} style={inputSt}>
              <option>Will</option><option>Ivanise</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addItem} style={btnSt(C.laranja)}>Registrar</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar item..." style={{...inputSt,width:200}} />
        {["todos",...Object.keys(STATUS_MANUT)].map(k=>(
          <button key={k} onClick={()=>setFilterStatus(k)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===k?C.laranja:C.cardBorder}`,
            background:filterStatus===k?`${C.laranja}22`:"transparent",
            color:filterStatus===k?C.laranja:C.textMuted,
          }}>{k==="todos"?"Todos":STATUS_MANUT[k]?.label}</button>
        ))}
      </div>

      {/* Items list */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        {filtered.map((item,i)=>{
          const sc = STATUS_MANUT[item.status];
          const si = stepIdx(item.status);
          return (
            <div key={item.id} style={{
              borderBottom:i<filtered.length-1?`1px solid ${C.cardBorder}`:"none",
              padding:"12px 16px", cursor:"pointer",
              background:selected?.id===item.id?C.cardHover:"transparent",
            }} onClick={()=>setSelected(selected?.id===item.id?null:item)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.textPrimary,marginBottom:4}}>{item.nome}</div>
                  {/* Flow bar */}
                  <div style={{display:"flex",gap:2,marginBottom:4}}>
                    {FLOW_STEPS.map((step,idx)=>(
                      <div key={step.key} style={{
                        height:3, flex:1, borderRadius:2,
                        background: idx<=si ? sc.color : C.cardBorder,
                      }} />
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,color:sc.color}}>{sc.label}</span>
                    {item.motivo&&<span style={{fontSize:10,color:C.textMuted}}>· {item.motivo.slice(0,40)}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,marginLeft:12}}>
                  <select value={item.status} onChange={e=>{e.stopPropagation();updateItem(item.id,{status:e.target.value})}}
                    onClick={e=>e.stopPropagation()}
                    style={{background:"#0a0c14",border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                    {Object.entries(STATUS_MANUT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Expanded edit */}
              {selected?.id===item.id&&(
                <div style={{marginTop:12,padding:12,background:"#0a0c14",borderRadius:8}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <label style={labelSt}>Orçamento (R$)</label>
                      <input value={item.orcamentoValor} onChange={e=>updateItem(item.id,{orcamentoValor:e.target.value})} placeholder="Valor do orçamento" style={inputSt} />
                    </div>
                    <div>
                      <label style={labelSt}>Link do orçamento (Drive)</label>
                      <input value={item.orcamentoLink} onChange={e=>updateItem(item.id,{orcamentoLink:e.target.value})} placeholder="https://drive.google.com/..." style={inputSt} />
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={labelSt}>Enviado para aprovação</label>
                    <div style={{display:"flex",gap:8}}>
                      {["Júnior","Mariana"].map(p=>(
                        <label key={p} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,color:C.textMuted}}>
                          <input type="checkbox" checked={(item.enviadoPara||[]).includes(p)}
                            onChange={e=>{
                              const arr = item.enviadoPara||[];
                              updateItem(item.id,{enviadoPara:e.target.checked?[...arr,p]:arr.filter(x=>x!==p)});
                            }} />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                    {[["dataEntrada","Entrada manut."],["dataEnvio","Envio peça"],["dataChegada","Chegada peça"],["dataManutencao","Início manut."],["dataRetorno","Retorno estoque"]].slice(0,3).map(([k,l])=>(
                      <div key={k}>
                        <label style={labelSt}>{l}</label>
                        <input type="date" value={item[k]||""} onChange={e=>updateItem(item.id,{[k]:e.target.value})} style={inputSt} />
                      </div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    {[["dataManutencao","Início manut."],["dataRetorno","Retorno estoque"]].map(([k,l])=>(
                      <div key={k}>
                        <label style={labelSt}>{l}</label>
                        <input type="date" value={item[k]||""} onChange={e=>updateItem(item.id,{[k]:e.target.value})} style={inputSt} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={labelSt}>Observações</label>
                    <textarea value={item.observacoes} onChange={e=>updateItem(item.id,{observacoes:e.target.value})}
                      placeholder="Notas adicionais..." style={{...inputSt,height:55,resize:"vertical"}} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted}}>Nenhum item encontrado</div>
        )}
      </div>
    </div>
  );
}

// ─── 3D PRINT MODULE ─────────────────────────────────────────
function Print3DModule() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    unidade:"",descricao:"",temProjeto:false,
    statusProjeto:"aguardando_junior",prazoJunior:"",
    statusImpressao:"na_fila",dataImpressao:"",
    dataEnvio:"",rastreio:"",dataEntrega:"",responsavel:"Will",observacoes:""
  });

  const STATUS_3D_PROJETO = {aguardando_junior:"Aguardando Júnior",projeto_em_andamento:"Projeto em andamento",projeto_pronto:"Projeto pronto"};
  const STATUS_3D_PRINT = {na_fila:"Na fila",imprimindo:"Imprimindo",pronto_para_envio:"Pronto p/ envio",enviado:"Enviado",entregue:"Entregue"};
  const statusColor = {aguardando_junior:C.red,projeto_em_andamento:C.amarelo,projeto_pronto:C.verde,na_fila:C.textMuted,imprimindo:C.laranja,pronto_para_envio:C.amarelo,enviado:C.azul,entregue:C.verde};

  function addItem() {
    if(!newItem.descricao.trim()) return;
    setItems(prev=>[...prev,{...newItem,id:Date.now(),dataSolicitacao:TODAY.toISOString().slice(0,10)}]);
    setNewItem({unidade:"",descricao:"",temProjeto:false,statusProjeto:"aguardando_junior",prazoJunior:"",statusImpressao:"na_fila",dataImpressao:"",dataEnvio:"",rastreio:"",dataEntrega:"",responsavel:"Will",observacoes:""});
    setShowForm(false);
  }

  function updateItem(id,updates) { setItems(prev=>prev.map(i=>i.id===id?{...i,...updates}:i)); }

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🖨️ Impressão 3D</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{items.filter(i=>i.statusImpressao!=="entregue").length} pedidos ativos · {items.filter(i=>i.statusImpressao==="entregue").length} entregues</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.azul)}>+ Novo pedido</button>
      </div>

      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.azul}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Novo pedido 3D</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <label style={labelSt}>Unidade solicitante</label>
              <input value={newItem.unidade} onChange={e=>setNewItem({...newItem,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Responsável</label>
              <select value={newItem.responsavel} onChange={e=>setNewItem({...newItem,responsavel:e.target.value})} style={inputSt}>
                <option>Will</option><option>Ivanise</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <label style={labelSt}>Descrição da peça</label>
            <textarea value={newItem.descricao} onChange={e=>setNewItem({...newItem,descricao:e.target.value})} placeholder="Descrição detalhada da peça necessária" style={{...inputSt,height:55,resize:"vertical"}} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:C.textPrimary}}>
              <input type="checkbox" checked={newItem.temProjeto} onChange={e=>setNewItem({...newItem,temProjeto:e.target.checked})} />
              Já existe projeto 3D
            </label>
          </div>
          {!newItem.temProjeto&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <label style={labelSt}>Status projeto (Júnior)</label>
                <select value={newItem.statusProjeto} onChange={e=>setNewItem({...newItem,statusProjeto:e.target.value})} style={inputSt}>
                  {Object.entries(STATUS_3D_PROJETO).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Prazo para Júnior</label>
                <input type="date" value={newItem.prazoJunior} onChange={e=>setNewItem({...newItem,prazoJunior:e.target.value})} style={inputSt} />
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button onClick={addItem} style={btnSt(C.azul)}>Criar pedido</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {items.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:36,marginBottom:10}}>🖨️</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Nenhum pedido 3D ainda</div>
          <div style={{fontSize:12,marginTop:4}}>Clique em "+ Novo pedido" para registrar</div>
        </div>
      ):(
        <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
          {items.map((item,i)=>{
            const projReady = item.temProjeto || item.statusProjeto==="projeto_pronto";
            const printSc = STATUS_3D_PRINT[item.statusImpressao];
            const projSc = item.temProjeto ? null : STATUS_3D_PROJETO[item.statusProjeto];
            return (
              <div key={item.id} style={{borderBottom:i<items.length-1?`1px solid ${C.cardBorder}`:"none",padding:"12px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{item.descricao}</div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{item.unidade} · Solicitado {fmtDate(item.dataSolicitacao)}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    {!item.temProjeto&&(
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${statusColor[item.statusProjeto]}22`,color:statusColor[item.statusProjeto]}}>
                        {projSc}
                      </span>
                    )}
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${statusColor[item.statusImpressao]}22`,color:statusColor[item.statusImpressao]}}>
                      {printSc}
                    </span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {!item.temProjeto&&!projReady&&(
                    <select value={item.statusProjeto} onChange={e=>updateItem(item.id,{statusProjeto:e.target.value})}
                      style={{background:"#0a0c14",border:`1px solid ${C.cardBorder}`,color:statusColor[item.statusProjeto],fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                      {Object.entries(STATUS_3D_PROJETO).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  )}
                  <select value={item.statusImpressao} onChange={e=>updateItem(item.id,{statusImpressao:e.target.value})}
                    style={{background:"#0a0c14",border:`1px solid ${C.cardBorder}`,color:statusColor[item.statusImpressao],fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                    {Object.entries(STATUS_3D_PRINT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  {item.statusImpressao==="enviado"&&(
                    <input value={item.rastreio} onChange={e=>updateItem(item.id,{rastreio:e.target.value})}
                      placeholder="Código rastreio" style={{...inputSt,width:150,fontSize:11,padding:"3px 8px"}} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DIÁRIO DE BORDO ─────────────────────────────────────────
function DiarioView({ units, dbStatus }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ data:TODAY.toISOString().slice(0,10), canal:"Grupo WhatsApp", assunto:"", detalhe:"", responsavel:"Ivanise", unidade:"", prioridade:"Média" });

  // Load from Supabase
  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("diario", "?select=*&order=data.desc").then(rows => {
      if (rows?.length) setEntries(rows.map(r => ({
        id: r.id, data: r.data, canal: r.canal, unidade: r.unidade,
        assunto: r.assunto, detalhe: r.detalhe, responsavel: r.responsavel,
        prioridade: r.prioridade, status: r.status,
      })));
    }).catch(() => {});
  }, [dbStatus]);

  async function addEntry() {
    if(!form.assunto.trim()) return;
    const newEntry = {...form, id: crypto.randomUUID(), status:"pendente", criadoEm: new Date().toISOString()};
    setEntries(prev=>[newEntry,...prev]);
    setForm({...form, assunto:"", detalhe:"", unidade:""});
    if (dbStatus === "ok") {
      try {
        await sb.post("diario", {
          id: newEntry.id, data: newEntry.data, canal: newEntry.canal,
          unidade: newEntry.unidade, assunto: newEntry.assunto,
          detalhe: newEntry.detalhe, responsavel: newEntry.responsavel,
          prioridade: newEntry.prioridade, status: "pendente",
        });
      } catch(e) { console.warn("Diário save error:", e.message); }
    }
  }

  async function resolveEntry(id) {
    setEntries(prev=>prev.map(x=>x.id===id?{...x,status:"resolvido"}:x));
    if (dbStatus === "ok") {
      try { await sb.patch("diario", id, {status:"resolvido",updated_at:new Date().toISOString()}); }
      catch(e) { console.warn(e.message); }
    }
  }

  const pendentes = entries.filter(e=>e.status==="pendente");
  const resolvidos = entries.filter(e=>e.status==="resolvido");

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>📓 Diário de Bordo</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Pontos de grupos e conversas que viraram pendência</div>
      </div>

      {/* Form */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:12}}>Registrar ponto</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <label style={labelSt}>Data</label>
            <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Canal / origem</label>
            <select value={form.canal} onChange={e=>setForm({...form,canal:e.target.value})} style={inputSt}>
              {["Grupo WhatsApp","DM WhatsApp","Grupo Telegram","Ligação","Email","Reunião informal","Outro"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Unidade (se específica)</label>
            <input list="units-list" value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            <datalist id="units-list">{units.map(u=><option key={u.id} value={u.name}/>)}</datalist>
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <label style={labelSt}>Assunto / pendência</label>
          <input value={form.assunto} onChange={e=>setForm({...form,assunto:e.target.value})} placeholder="O que foi levantado?" style={inputSt} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={labelSt}>Detalhes (opcional)</label>
          <textarea value={form.detalhe} onChange={e=>setForm({...form,detalhe:e.target.value})} placeholder="Mais contexto..." style={{...inputSt,height:55,resize:"vertical"}} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <label style={labelSt}>Responsável</label>
            <select value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} style={inputSt}>
              <option>Ivanise</option><option>Will</option><option>Franqueado</option><option>Júnior</option><option>Mariana</option><option>Outro</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Prioridade</label>
            <select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})} style={inputSt}>
              <option>Alta</option><option>Média</option><option>Baixa</option>
            </select>
          </div>
        </div>
        <button onClick={addEntry} style={btnSt(C.laranja)}>Registrar</button>
      </div>

      {/* Pending */}
      {pendentes.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Pendentes ({pendentes.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
            {pendentes.map((e,i)=>{
              const prioColor={Alta:C.red,Média:C.amarelo,Baixa:C.textMuted};
              return(
                <div key={e.id} style={{padding:"10px 14px",borderBottom:i<pendentes.length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"flex-start",gap:12}}>
                  <button onClick={()=>resolveEntry(e.id)}
                    style={{width:20,height:20,borderRadius:4,border:`2px solid ${C.cardBorder}`,background:"transparent",cursor:"pointer",flexShrink:0,marginTop:2}} />
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{e.assunto}</div>
                    {e.detalhe&&<div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{e.detalhe}</div>}
                    <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:prioColor[e.prioridade]}}>● {e.prioridade}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{e.canal}</span>
                      {e.unidade&&<span style={{fontSize:10,color:C.azul}}>{e.unidade}</span>}
                      <span style={{fontSize:10,color:C.textMuted}}>→ {e.responsavel}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{fmtDate(e.data)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resolvidos.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Resolvidos ({resolvidos.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden",opacity:0.6}}>
            {resolvidos.slice(0,5).map((e,i)=>(
              <div key={e.id} style={{padding:"8px 14px",borderBottom:i<resolvidos.slice(0,5).length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14,color:C.verde}}>✓</span>
                <div style={{fontSize:12,color:C.textMuted,textDecoration:"line-through"}}>{e.assunto}</div>
                <span style={{fontSize:10,color:C.textMuted,marginLeft:"auto"}}>{fmtDate(e.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length===0&&(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:36,marginBottom:10}}>📓</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Diário vazio</div>
          <div style={{fontSize:12,marginTop:4}}>Use este espaço para registrar pontos dos grupos que precisam de atenção</div>
        </div>
      )}
    </div>
  );
}

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

  return (
    <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}}>
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
function DashboardView({ units, onSelectUnit }) {
  const [viewMode, setViewMode] = useState("diretoria"); // diretoria | supervisao | rede
  const [showPreMeeting, setShowPreMeeting] = useState(null);
  const [preMeetingData, setPreMeetingData] = useState({});

  // ── Supervisão metrics ──────────────────────────────────────
  const allTasks = units.flatMap(u=>(u.tasks||[]).map(t=>({...t,unitName:u.name,group:u.group})));
  const openTasks = allTasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
  const inProgressTasks = allTasks.filter(t=>t.status==="em_andamento");
  const doneTasks = allTasks.filter(t=>t.status==="concluido");
  const overdueTasks = openTasks.filter(t=>t.meetingData&&daysSince(t.meetingData)>14);
  const tasksByResp = openTasks.reduce((acc,t)=>({...acc,[t.responsavel]:(acc[t.responsavel]||0)+1}),{});
  const inProgressByResp = inProgressTasks.reduce((acc,t)=>({...acc,[t.responsavel]:(acc[t.responsavel]||0)+1}),{});

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
                <div key={p.nome} style={{background:"#0a0c14",borderRadius:10,padding:"12px 14px",border:`1px solid ${p.cor}33`}}>
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
                {label:"Tarefas em andamento",value:inProgressTasks.length,total:null,color:C.amarelo},
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
                  <div key={g} style={{background:"#0a0c14",borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
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
                {unitsSemFat>0&&<div style={{fontSize:12,color:C.amarelo}}>• {unitsSemFat} unidades sem faturamento em maio — verificar operação</div>}
                {unitsNeedContact.length>0&&<div style={{fontSize:12,color:C.amarelo}}>• {unitsNeedContact.length} unidades com contato atrasado conforme frequência do grupo</div>}
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
                <div key={s.label} style={{background:"#0a0c14",borderRadius:8,padding:"10px",textAlign:"center"}}>
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
                <div key={item.indicador} style={{background:"#0a0c14",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.rosa}}>{item.peso}pts</div>
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
                    <div key={unitId} style={{display:"flex",alignItems:"center",gap:12,padding:"6px 10px",background:"#0a0c14",borderRadius:8}}>
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
                <div key={pilar.titulo} style={{background:"#0a0c14",borderRadius:8,padding:"10px 12px",border:`1px solid ${pilar.cor}22`}}>
                  <div style={{fontSize:12,fontWeight:700,color:pilar.cor,marginBottom:6}}>{pilar.titulo}</div>
                  {pilar.itens.map(item=>(
                    <div key={item} style={{fontSize:11,color:C.textMuted,padding:"2px 0",borderBottom:`1px solid ${C.cardBorder}`}}>· {item}</div>
                  ))}
                  <div style={{fontSize:9,color:C.textMuted,marginTop:6}}>📥 Fonte: {pilar.fonte}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:"8px 10px",background:`${C.amarelo}11`,borderRadius:6,fontSize:10,color:C.amarelo}}>
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

// ─── CAMPAIGN ADHERENCE COMPONENT ────────────────────────────
function CampanhasView({ units, onUpdateUnit }) {
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
    let aderiu = current.aderiu;
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
            <div style={{marginTop:8,padding:"6px 10px",background:"#ffffff0a",borderRadius:6,fontSize:10,color:C.amarelo}}>
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
                <div style={{padding:"12px 16px",background:"#0a0c14",borderTop:`1px solid ${C.cardBorder}`}}>
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
              <tr style={{borderBottom:`1px solid ${C.cardBorder}`,background:"#0a0c14"}}>
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
                const cfg=GROUP_CFG[group];
                return (
                  <tr key={group} style={{borderBottom:`1px solid ${C.cardBorder}`}}>
                    <td style={{padding:"8px 12px"}}><GroupBadge group={group} small /></td>
                    <td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{gUnits.length}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:C.verde}}>{gs.sim}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:C.amarelo}}>{gs.parcial}</td>
                    <td style={{padding:"8px 12px",fontSize:12,fontWeight:700,color:C.red}}>{gs.nao}</td>
                    <td style={{padding:"8px 12px",fontSize:12,color:C.textMuted}}>{gs.sem_resposta}</td>
                    <td style={{padding:"8px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,fontWeight:700,color:pct>=80?C.verde:pct>=50?C.amarelo:C.red}}>{pct}%</span>
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


// ─── ETAPA 1 CHECKLIST ───────────────────────────────────────
const ETAPA1_ITEMS = [
  // DIVERSOS
  { id:"e1_01", grupo:"Diversos", titulo:"Criar e-mail da unidade no Gmail", desc:"Padrão: ig@gmail.com (ex.: clubkidsjoaopessoa@gmail.com)", resp:"Franqueado" },
  { id:"e1_02", grupo:"Diversos", titulo:"Abrir MEI", desc:"CNAE 7721-7/00 + CNAE 4763-6/01. Atenção: não pagar boleto por e-mail após abertura.", resp:"Franqueado" },
  { id:"e1_03", grupo:"Diversos", titulo:"Solicitar Inscrição Estadual", desc:"CNAE 4763-6/01. Após receber, preencher planilha DADOS DA UNIDADE e enviar para a franqueadora.", resp:"Franqueado" },
  { id:"e1_04", grupo:"Diversos", titulo:"Compra imediata de chip de celular", desc:"Para personalização prévia de cartão de visita e panfleto.", resp:"Franqueado" },
  { id:"e1_05", grupo:"Diversos", titulo:"Celular para uso exclusivo do o clubkids", desc:"iPhone a partir do 11 ou Samsung a partir do S11. Se já possui, comprar chip virtual.", resp:"Franqueado" },
  { id:"e1_06", grupo:"Diversos", titulo:"Pesquisar parcerias e enviar links para validação", desc:"Influencers gestantes/filhos 0-4a, fotógrafo newborn, pediatras, doulas, maternidades, nutricionistas, escolas, buffets infantis, etc.", resp:"Franqueado", apoio:"Ivanise" },
  { id:"e1_07", grupo:"Diversos", titulo:"Explorar APENAS a pasta 1 ETAPA – Inauguração no Google Drive", desc:"Não acessar outras pastas ainda.", resp:"Franqueado" },
  { id:"e1_08", grupo:"Diversos", titulo:"Confecção de camisas padronizadas (serigrafia)", desc:"3 modelos disponíveis na pasta Drive: polo bordado, polo DTF, dryfit sublimação.", resp:"Franqueado" },
  { id:"e1_09", grupo:"Diversos", titulo:"Material gráfico — ATUALCARD + gráfica local", desc:"TAG 1ª locação (500), panfletos (2.500), cartão de visita (1.000 com verniz 30%), adesivo higienizado (500), adesivo carro (opc.), FlyBanner (opc.), livrinho pintura (opc.).", resp:"Franqueado" },
  { id:"e1_10", grupo:"Diversos", titulo:"Comprar material para embalagem dos brinquedos", desc:"Sacos plásticos (gramatura 12, cristal, 200 un, 0,80x1,10m e 0,80x0,60m), rolo filme PVC (2 un), rolo saco pequeno, durex largo, enforca gato 20cm.", resp:"Franqueado" },
  { id:"e1_11", grupo:"Diversos", titulo:"Comprar material para higienização", desc:"Sabão neutro, detergente neutro, álcool 70% (galão 5L), vaselina Doppler, buchas, pano perfex, chave de fenda, Vanish, limpa contato, gracha branca, silicone líquido.", resp:"Franqueado" },
  { id:"e1_12", grupo:"Diversos", titulo:"Compra de Bags para peças avulsas/carregadores (opcional)", desc:"Pastinha P 15x17, bolsinha c/ proteção 17x21x15, maletas transparentes P/M/G.", resp:"Franqueado", opcional:true },
  { id:"e1_13", grupo:"Diversos", titulo:"Compra de Etiquetadora", desc:"Para identificar controles de elétricos e fontes. Deve conter: PRODUTO – VOLTAGEM – AMPERAGEM.", resp:"Franqueado" },
  { id:"e1_14", grupo:"Diversos", titulo:"Compra de brinquedos (1ªs compras à vista/PIX no representante)", desc:"Franqueadora faz o 1º pedido. Franqueado paga direto ao fornecedor. Conferir endereço nos romaneios. Etiquetar carregadores.", resp:"Mariana", apoio:"Franqueado" },
  { id:"e1_15", grupo:"Diversos", titulo:"Preenchimento e envio da planilha de estoque no grupo WPP", desc:"Salvar planilha do Drive, preencher e enviar sempre que houver compra ou chegada. Colorir itens que chegarem para planejar entrega aos parceiros.", resp:"Franqueado" },
  { id:"e1_16", grupo:"Diversos", titulo:"Aulas na universidade corporativa", desc:"a) Processo para abertura de Franquia (30min) · b) Sistema de gerenciamento — Módulo 1 (2min) + Módulo 2 (7min).", resp:"Franqueado" },
  { id:"e1_17", grupo:"Diversos", titulo:"Cadastramento de brinquedos no sistema", desc:"Categorias 0-11 em sequência. Planos por tipo de produto (Doppler 30/60/90d, carros 7/15/30d, etc.).", resp:"Franqueado", apoio:"Jeniffer" },
  { id:"e1_18", grupo:"Diversos", titulo:"Colocar brinquedos em destaques no sistema", desc:"", resp:"Franqueado" },
  // INSTAGRAM
  { id:"e1_19", grupo:"Instagram", titulo:"Alterar senha do Instagram + autenticação de dois fatores", desc:"", resp:"Franqueado", apoio:"Jeniffer" },
  { id:"e1_20", grupo:"Instagram", titulo:"Publicar os 21 posts padronizados do feed (Trello)", desc:"Apenas salvar jpg, copiar legenda, editar telefone. NÃO alterar legendas. Reels podem ser feitos mas ocultados do feed até inauguração.", resp:"Franqueado" },
  { id:"e1_21", grupo:"Instagram", titulo:"Stories e Reels livres de qualidade", desc:"Apresentação, como funciona, sustentabilidade, enquetes, spoilers caixas, higienização, unboxing, entrega. Marcar @clubkidsoficial e @franquiasclubkids discretamente.", resp:"Franqueado" },
  { id:"e1_22", grupo:"Instagram", titulo:"Prospecção de clientes no Instagram", desc:"Seguir perfis de parceiros e público infantil (mulheres jovens com filhos). Máximo 20 por hora.", resp:"Franqueado" },
  { id:"e1_23", grupo:"Instagram", titulo:"Pedir ajuda a amigas mães para divulgar o Instagram", desc:"", resp:"Franqueado" },
  { id:"e1_24", grupo:"Instagram", titulo:"Navegar pelo Instagram de outras unidades como referência de conteúdo", desc:"", resp:"Franqueado" },
];

const ETAPAS_GESTACAO = [
  { id:"e1", numero:1, nome:"Etapa 1 — Diversos + Instagram", cor:"#f19134", items: ETAPA1_ITEMS.length, resp:"Franqueado + Jeniffer + Mariana" },
  { id:"e2", numero:2, nome:"Etapa 2 — Parcerias e chegada dos brinquedos", cor:"#6e81bf", items: 0, resp:"Franqueado + Ivanise", pendente:true },
  { id:"e3", numero:3, nome:"Etapa 3 — Estratégia de lançamento", cor:"#6ece87", items: 0, resp:"Franqueado + Ivanise", pendente:true },
  { id:"e4", numero:4, nome:"Etapa 4 — Reunião pré-inauguração", cor:"#a78bfa", items: 0, resp:"Ivanise", pendente:true },
];

// Pre-inauguration meetings from Drive
const PRE_INAUG_MEETINGS = [
  { unidade:"PR - TOLEDO", data:"2026-01-13", docId:"1N4QhnLF3mN_7ByXLi2yQ6xBCYL31jpKoIKmSxPJFcsI", franqueado:"Thiago Dalmaso + Helen + Regiane (Ituiutaba) + Fernanda (Barreiras)", extra:["BA - BARREIRAS","MG - ITUIUTABA"] },
  { unidade:"AL - ARAPIRACA", data:"2026-02-09", docId:"1eYE6aRV_d2QQ0dnQP5H3ziFBwYo2G9Jfuo8_c252WT8", franqueado:"ClubKids Arapiraca", gravacao:"https://drive.google.com/file/d/1abnnotL2cE2HzqqQl87yscKLm27rw89L/view" },
  { unidade:"MG - VIÇOSA", data:"2025-06-19", docId:"1GLYXPeoOkJzjSXucGrUKuCQgRp-XFNM-yDiZMlx5t1Y", franqueado:"Milla Valhe" },
  { unidade:"SP - INDAIATUBA", data:"2025-08-07", docId:"1tEVCH_lTs4Vw5u6-aT0WBUT-JTq8S5tC-VPi31mRTc0", franqueado:"Carol Biagioni", gravacao:"https://drive.google.com/file/d/1bCqpcrRCkOu5OlFFC1T2mB6NaCBnLlm2/view" },
  { unidade:"SP - PINDAMONHANGABA", data:"2025-07-10", docId:"1EW4oYBqGFPZ8o5ZlAuVaZnIMfP9FlzGIQ8n2samgaVI", franqueado:"Cristiane Carvalho + Rafael Brugnara", extra:["SP - PAULÍNIA"] },
];

// JP Staff
const JP_STAFF = [
  { id:"clenia", nome:"Clênia", funcao:"Atendimento", cor:"#f19134" },
  { id:"samara", nome:"Samara", funcao:"Pós-venda", cor:"#6e81bf" },
  { id:"fabio", nome:"Fábio", funcao:"Higienização", cor:"#6ece87" },
  { id:"renan", nome:"Renan", funcao:"Entregas e Manutenção", cor:"#a78bfa" },
];

// ─── INAUGURATION MODULE ─────────────────────────────────────
function InaugurationModule({ units }) {
  const [activeUnit, setActiveUnit] = useState(null);
  const [unitsData, setUnitsData] = useState({});
  const [filterStatus, setFilterStatus] = useState("em_gestacao");
  const [newUnit, setNewUnit] = useState({ nome:"", dataContrato:"", dataGrupoWPP:"" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [inauguracoes, setInauguracoes] = useState(() => {
    // Pre-populate with units that are still in bercario or recently inaugurated
    const bercarios = units.filter(u => u.group === "BERÇÁRIO");
    return bercarios.map(u => ({
      id: u.name,
      nome: u.name,
      dataContrato: u.inaug,
      dataGrupoWPP: u.inaug,
      dataInauguracao: u.inaug,
      etapaAtual: "inaugurada",
      etapaChecks: {},
      preInaugMeeting: PRE_INAUG_MEETINGS.find(m => m.unidade === u.name || (m.extra||[]).includes(u.name)) || null,
      observacoes: "",
    }));
  });

  const STATUS_OPTIONS = [
    { id:"em_gestacao", label:"🐣 Em gestação", cor:"#a78bfa" },
    { id:"inaugurada", label:"✅ Inaugurada", cor:"#6ece87" },
    { id:"todas", label:"Todas", cor:"#6b7280" },
  ];

  const filtered = inauguracoes.filter(u =>
    filterStatus === "todas" || u.etapaAtual === filterStatus
  );

  function addUnit() {
    if (!newUnit.nome.trim()) return;
    setInauguracoes(prev => [...prev, {
      id: `new_${Date.now()}`, nome: newUnit.nome,
      dataContrato: newUnit.dataContrato, dataGrupoWPP: newUnit.dataGrupoWPP,
      dataInauguracao: null, etapaAtual: "em_gestacao",
      etapaChecks: {}, preInaugMeeting: null, observacoes: "",
    }]);
    setNewUnit({ nome:"", dataContrato:"", dataGrupoWPP:"" });
    setShowAddForm(false);
  }

  function updateUnit(id, updates) {
    setInauguracoes(prev => prev.map(u => u.id === id ? {...u,...updates} : u));
    if (activeUnit?.id === id) setActiveUnit(u => ({...u,...updates}));
  }

  function toggleCheck(unitId, etapaId, itemId, val) {
    setInauguracoes(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      const ec = u.etapaChecks || {};
      const etapaChecks = ec[etapaId] || {};
      const newChecks = { ...etapaChecks, [itemId]: val };
      // Auto-advance etapa when all items checked
      const etapa = ETAPAS_GESTACAO.find(e => e.id === etapaId);
      const etapaItems = etapa?.id === "e1" ? ETAPA1_ITEMS : [];
      const allDone = etapaItems.length > 0 && etapaItems.every(i => newChecks[i.id]);
      return { ...u, etapaChecks: { ...ec, [etapaId]: newChecks } };
    }));
  }

  function getProgress(unit, etapaId) {
    const etapa = ETAPAS_GESTACAO.find(e => e.id === etapaId);
    const items = etapa?.id === "e1" ? ETAPA1_ITEMS : [];
    if (items.length === 0) return { done: 0, total: 0, pct: 0 };
    const checks = unit.etapaChecks?.[etapaId] || {};
    const done = items.filter(i => checks[i.id]).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  }

  const emGestacao = inauguracoes.filter(u => u.etapaAtual === "em_gestacao").length;
  const inauguradas = inauguracoes.filter(u => u.etapaAtual === "inaugurada").length;

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🐣 Inaugurações — Fase de Gestação</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>
            {emGestacao} em gestação · {inauguradas} inauguradas recentemente
          </div>
        </div>
        <button onClick={()=>setShowAddForm(!showAddForm)} style={btnSt(C.bercario)}>+ Nova unidade</button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{background:C.card,border:`1px solid ${C.bercario}44`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar nova unidade em gestação</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <label style={labelSt}>Nome da unidade</label>
              <input list="all-units" value={newUnit.nome} onChange={e=>setNewUnit({...newUnit,nome:e.target.value})} placeholder="Ex: SP - CAMPINAS" style={inputSt} />
              <datalist id="all-units">{units.map(u=><option key={u.id} value={u.name}/>)}</datalist>
            </div>
            <div>
              <label style={labelSt}>Data assinatura contrato</label>
              <input type="date" value={newUnit.dataContrato} onChange={e=>setNewUnit({...newUnit,dataContrato:e.target.value})} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Data criação grupo WPP</label>
              <input type="date" value={newUnit.dataGrupoWPP} onChange={e=>setNewUnit({...newUnit,dataGrupoWPP:e.target.value})} style={inputSt} />
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addUnit} style={btnSt(C.bercario)}>Registrar</button>
            <button onClick={()=>setShowAddForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {STATUS_OPTIONS.map(s=>(
          <button key={s.id} onClick={()=>setFilterStatus(s.id)} style={{
            padding:"4px 12px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===s.id?s.cor:C.cardBorder}`,
            background:filterStatus===s.id?`${s.cor}22`:"transparent",
            color:filterStatus===s.id?s.cor:C.textMuted,
          }}>{s.label}</button>
        ))}
      </div>

      {/* Units list */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:32,marginBottom:10}}>🐣</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Nenhuma unidade nessa fase</div>
          <div style={{fontSize:12,marginTop:4}}>Registre uma nova unidade em gestação acima</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(unit => {
            const e1prog = getProgress(unit, "e1");
            const preInaugMeet = PRE_INAUG_MEETINGS.find(m =>
              m.unidade === unit.nome || (m.extra||[]).includes(unit.nome)
            );
            const isOpen = activeUnit?.id === unit.id;
            const daysInProcess = unit.dataContrato ? Math.floor((TODAY - new Date(unit.dataContrato)) / 86400000) : null;

            return (
              <div key={unit.id} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
                {/* Header row */}
                <div onClick={()=>setActiveUnit(isOpen?null:unit)}
                  style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:700,color:C.textPrimary}}>{unit.nome}</span>
                      <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,
                        background:unit.etapaAtual==="inaugurada"?`${C.verde}22`:`${C.bercario}22`,
                        color:unit.etapaAtual==="inaugurada"?C.verde:C.bercario,
                        border:`1px solid ${unit.etapaAtual==="inaugurada"?C.verde:C.bercario}44`}}>
                        {unit.etapaAtual==="inaugurada"?"✅ Inaugurada":"🐣 Em gestação"}
                      </span>
                      {preInaugMeet && <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${C.azul}22`,color:C.azul}}>Reunião pré-inaug ✓</span>}
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {unit.dataContrato&&<span style={{fontSize:10,color:C.textMuted}}>📝 Contrato: {fmtDate(unit.dataContrato)}</span>}
                      {unit.dataGrupoWPP&&<span style={{fontSize:10,color:C.textMuted}}>💬 Grupo WPP: {fmtDate(unit.dataGrupoWPP)}</span>}
                      {daysInProcess!==null&&<span style={{fontSize:10,color:C.textMuted}}>{daysInProcess} dias no processo</span>}
                      {unit.dataInauguracao&&<span style={{fontSize:10,color:C.verde}}>🎉 Inaugurou: {fmtDate(unit.dataInauguracao)}</span>}
                    </div>
                  </div>

                  {/* Etapa 1 progress */}
                  <div style={{width:100,flexShrink:0}}>
                    <div style={{fontSize:9,color:C.textMuted,marginBottom:2}}>Etapa 1: {e1prog.done}/{e1prog.total}</div>
                    <ProgressBar pct={e1prog.pct} color={C.laranja} height={4} />
                  </div>
                  <span style={{fontSize:11,color:C.textMuted}}>{isOpen?"▲":"▼"}</span>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{borderTop:`1px solid ${C.cardBorder}`,padding:"14px 16px"}}>

                    {/* Quick actions */}
                    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                      <div>
                        <label style={labelSt}>Status</label>
                        <select value={unit.etapaAtual} onChange={e=>updateUnit(unit.id,{etapaAtual:e.target.value})} style={inputSt}>
                          <option value="em_gestacao">🐣 Em gestação</option>
                          <option value="inaugurada">✅ Inaugurada</option>
                        </select>
                      </div>
                      {unit.etapaAtual==="inaugurada"&&(
                        <div>
                          <label style={labelSt}>Data de inauguração</label>
                          <input type="date" value={unit.dataInauguracao||""} onChange={e=>updateUnit(unit.id,{dataInauguracao:e.target.value})} style={inputSt} />
                        </div>
                      )}
                    </div>

                    {/* Reunião pré-inauguração */}
                    {preInaugMeet && (
                      <div style={{background:`${C.azul}11`,border:`1px solid ${C.azul}33`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.azul,marginBottom:2}}>📋 Reunião pré-inauguração registrada</div>
                        <div style={{fontSize:11,color:C.textMuted}}>{fmtDate(preInaugMeet.data)} · {preInaugMeet.franqueado}</div>
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <a href={`https://docs.google.com/document/d/${preInaugMeet.docId}/edit`} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:C.azul,textDecoration:"none"}}>🔗 Ver ata</a>
                          {preInaugMeet.gravacao&&<a href={preInaugMeet.gravacao} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:C.verde,textDecoration:"none"}}>📹 Gravação</a>}
                        </div>
                      </div>
                    )}

                    {/* Etapas */}
                    {ETAPAS_GESTACAO.map(etapa => {
                      const prog = getProgress(unit, etapa.id);
                      const items = etapa.id === "e1" ? ETAPA1_ITEMS : [];
                      const grupos = [...new Set(items.map(i=>i.grupo))];
                      return (
                        <div key={etapa.id} style={{marginBottom:12,border:`1px solid ${etapa.cor}33`,borderRadius:10,overflow:"hidden"}}>
                          <div style={{padding:"8px 12px",background:`${etapa.cor}11`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <span style={{fontSize:12,fontWeight:700,color:etapa.cor}}>{etapa.nome}</span>
                              <span style={{fontSize:10,color:C.textMuted,marginLeft:8}}>→ {etapa.resp}</span>
                              {etapa.pendente&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${C.amarelo}22`,color:C.amarelo,marginLeft:6}}>PDF pendente</span>}
                            </div>
                            {prog.total>0&&(
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:10,fontWeight:700,color:prog.pct===100?C.verde:etapa.cor}}>{prog.done}/{prog.total}</span>
                                <div style={{width:60}}><ProgressBar pct={prog.pct} color={etapa.cor} height={4}/></div>
                              </div>
                            )}
                          </div>
                          {etapa.pendente ? (
                            <div style={{padding:"8px 12px",fontSize:11,color:C.textMuted}}>⏳ Checklist pendente — PDF das etapas 3 e 4 ainda não recebido.</div>
                          ) : (
                            <div style={{padding:"6px 0"}}>
                              {grupos.map(grupo=>(
                                <div key={grupo}>
                                  <div style={{padding:"4px 12px",fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",background:"#0a0c14"}}>{grupo}</div>
                                  {items.filter(i=>i.grupo===grupo).map(item=>{
                                    const checked = unit.etapaChecks?.[etapa.id]?.[item.id] || false;
                                    return (
                                      <label key={item.id} style={{
                                        display:"flex",alignItems:"flex-start",gap:10,padding:"7px 12px",cursor:"pointer",
                                        background:checked?`${etapa.cor}08`:"transparent",
                                        borderBottom:`1px solid ${C.cardBorder}`,
                                      }}>
                                        <input type="checkbox" checked={checked}
                                          onChange={e=>toggleCheck(unit.id,etapa.id,item.id,e.target.checked)}
                                          style={{marginTop:2,flexShrink:0,accentColor:etapa.cor}} />
                                        <div style={{flex:1}}>
                                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                                            <span style={{fontSize:12,fontWeight:600,color:checked?C.textMuted:C.textPrimary,
                                              textDecoration:checked?"line-through":"none"}}>{item.titulo}</span>
                                            {item.opcional&&<span style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:`${C.textMuted}22`,color:C.textMuted}}>opcional</span>}
                                          </div>
                                          {item.desc&&<div style={{fontSize:10,color:C.textMuted,marginTop:1,lineHeight:1.4}}>{item.desc}</div>}
                                          <div style={{display:"flex",gap:8,marginTop:2}}>
                                            <span style={{fontSize:9,color:etapa.cor}}>→ {item.resp}</span>
                                            {item.apoio&&<span style={{fontSize:9,color:C.textMuted}}>apoio: {item.apoio}</span>}
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Observações */}
                    <div>
                      <label style={labelSt}>Observações</label>
                      <textarea value={unit.observacoes||""} onChange={e=>updateUnit(unit.id,{observacoes:e.target.value})}
                        placeholder="Notas sobre o processo de inauguração..." style={{...inputSt,height:55,resize:"vertical"}} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ANIVERSARIANTES/DESTAQUES MODULE ────────────────────────
function AniversariantesModule() {
  const [mes, setMes] = useState(() => { const d = new Date("2026-06-03"); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  const [demandas, setDemandas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo:"aniversariante", nome:"", unidade:"", artePedida:"", arteLink:"", dataEnvioArte:"", dataPublicacao:"", statusArte:"pendente", observacao:"" });

  const STATUS_ARTE = {
    pendente: { label:"Pendente", color:C.amarelo },
    solicitado: { label:"Solicitado para Artur", color:C.azul },
    pronto: { label:"Arte pronta", color:C.verde },
    publicado: { label:"Publicado @franquiasclubkids", color:C.verde },
  };

  const mesDemandas = demandas.filter(d => d.mes === mes);
  const aniversariantes = mesDemandas.filter(d => d.tipo === "aniversariante");
  const destaques = mesDemandas.filter(d => d.tipo === "destaque");

  const mesLabel = new Date(mes+"-15").toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  const hoje = new Date("2026-06-03");
  const quintoUtil = new Date(mes+"-05");

  function addDemanda() {
    if (!form.nome.trim()) return;
    setDemandas(prev=>[...prev,{...form,id:Date.now(),mes,criadoEm:hoje.toISOString().slice(0,10)}]);
    setForm({tipo:"aniversariante",nome:"",unidade:"",artePedida:"",arteLink:"",dataEnvioArte:"",dataPublicacao:"",statusArte:"pendente",observacao:""});
    setShowForm(false);
  }

  function updateDemanda(id,updates) { setDemandas(prev=>prev.map(d=>d.id===id?{...d,...updates}:d)); }

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🎂 Aniversariantes e Destaques</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Controle mensal — Will gera até 5º dia útil → Artur cria arte → @franquiasclubkids</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{...inputSt,width:140}} />
          <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.laranja)}>+ Adicionar</button>
        </div>
      </div>

      {/* Status bar */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <span style={{fontSize:11,color:C.textMuted}}>Mês: </span>
          <span style={{fontSize:12,fontWeight:700,color:C.textPrimary,textTransform:"capitalize"}}>{mesLabel}</span>
        </div>
        <div>
          <span style={{fontSize:11,color:C.textMuted}}>Prazo Will: </span>
          <span style={{fontSize:12,fontWeight:700,color:C.amarelo}}>até 5º dia útil</span>
        </div>
        <div style={{display:"flex",gap:12}}>
          <span style={{fontSize:11,color:C.textMuted}}>🎂 Aniversariantes: <b style={{color:C.textPrimary}}>{aniversariantes.length}</b></span>
          <span style={{fontSize:11,color:C.textMuted}}>⭐ Destaques: <b style={{color:C.textPrimary}}>{destaques.length}</b></span>
          <span style={{fontSize:11,color:C.verde}}>✅ Publicados: <b>{mesDemandas.filter(d=>d.statusArte==="publicado").length}</b></span>
        </div>
      </div>

      {/* Form */}
      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.laranja}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <label style={labelSt}>Tipo</label>
              <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} style={inputSt}>
                <option value="aniversariante">🎂 Aniversariante</option>
                <option value="destaque">⭐ Destaque do mês</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Nome do franqueado</label>
              <input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Unidade</label>
              <input value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <label style={labelSt}>Descrição da arte pedida a Artur</label>
              <input value={form.artePedida} onChange={e=>setForm({...form,artePedida:e.target.value})} placeholder="Ex: card aniversário padrão com foto" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Status da arte</label>
              <select value={form.statusArte} onChange={e=>setForm({...form,statusArte:e.target.value})} style={inputSt}>
                {Object.entries(STATUS_ARTE).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addDemanda} style={btnSt(C.laranja)}>Adicionar</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* List by type */}
      {[{tipo:"aniversariante",label:"🎂 Aniversariantes",items:aniversariantes},{tipo:"destaque",label:"⭐ Destaques do mês",items:destaques}].map(section=>(
        <div key={section.tipo} style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
            {section.label} ({section.items.length})
          </div>
          {section.items.length===0?(
            <div style={{padding:"14px",background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,fontSize:12,color:C.textMuted,textAlign:"center"}}>
              Nenhum {section.tipo} registrado para {mesLabel}
            </div>
          ):(
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,overflow:"hidden"}}>
              {section.items.map((d,i)=>{
                const sc=STATUS_ARTE[d.statusArte];
                return (
                  <div key={d.id} style={{padding:"10px 14px",borderBottom:i<section.items.length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{d.nome}</div>
                      <div style={{fontSize:11,color:C.textMuted}}>{d.unidade}</div>
                      {d.artePedida&&<div style={{fontSize:10,color:C.textMuted,marginTop:2}}>Arte: {d.artePedida}</div>}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                      {d.arteLink&&<a href={d.arteLink} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.azul,textDecoration:"none"}}>🔗 Arte</a>}
                      <select value={d.statusArte} onChange={e=>updateDemanda(d.id,{statusArte:e.target.value})}
                        style={{background:"#0a0c14",border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                        {Object.entries(STATUS_ARTE).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── JP LOJA MODULE ───────────────────────────────────────────
function LojaJPModule() {
  const [staffTasks, setStaffTasks] = useState(
    JP_STAFF.reduce((acc,s)=>({...acc,[s.id]:[]}),{})
  );
  const [activeStaff, setActiveStaff] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({titulo:"",prioridade:"Alta",status:"nao_iniciado",prazo:"",observacao:""});

  function addTask(staffId) {
    if(!newTask.titulo.trim()) return;
    setStaffTasks(prev=>({...prev,[staffId]:[...prev[staffId],{...newTask,id:Date.now(),criadoEm:TODAY.toISOString().slice(0,10)}]}));
    setNewTask({titulo:"",prioridade:"Alta",status:"nao_iniciado",prazo:"",observacao:""});
    setShowForm(false);
  }

  function updateTask(staffId,taskId,updates) {
    setStaffTasks(prev=>({...prev,[staffId]:prev[staffId].map(t=>t.id===taskId?{...t,...updates}:t)}));
  }

  const totalOpen = Object.values(staffTasks).flat().filter(t=>t.status!=="concluido"&&t.status!=="cancelado").length;
  const totalDone = Object.values(staffTasks).flat().filter(t=>t.status==="concluido").length;

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🏠 Loja JP — João Pessoa</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Unidade 01 · Equipe de 4 funcionários · {totalOpen} tarefas abertas · {totalDone} concluídas</div>
      </div>

      {/* Staff cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
        {JP_STAFF.map(staff=>{
          const tasks = staffTasks[staff.id]||[];
          const open = tasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
          const isActive = activeStaff===staff.id;
          return (
            <div key={staff.id} style={{background:C.card,border:`1px solid ${isActive?staff.cor:C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
              <div onClick={()=>setActiveStaff(isActive?null:staff.id)}
                style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`${staff.cor}22`,border:`2px solid ${staff.cor}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:staff.cor}}>
                    {staff.nome[0]}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{staff.nome}</div>
                    <div style={{fontSize:11,color:staff.cor}}>{staff.funcao}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:open.length>0?C.amarelo:C.verde}}>{open.length}</div>
                  <div style={{fontSize:9,color:C.textMuted}}>abertas</div>
                </div>
              </div>

              {isActive&&(
                <div style={{borderTop:`1px solid ${C.cardBorder}`,padding:"10px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:11,color:C.textMuted}}>{open.length} aberta(s)</span>
                    <button onClick={()=>setShowForm(staff.id)} style={{background:"none",border:`1px solid ${staff.cor}`,color:staff.cor,fontSize:10,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>+ Tarefa</button>
                  </div>

                  {showForm===staff.id&&(
                    <div style={{background:"#0a0c14",borderRadius:8,padding:10,marginBottom:8}}>
                      <input value={newTask.titulo} onChange={e=>setNewTask({...newTask,titulo:e.target.value})} placeholder="Título da tarefa" style={{...inputSt,marginBottom:6}} />
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        <select value={newTask.prioridade} onChange={e=>setNewTask({...newTask,prioridade:e.target.value})} style={inputSt}>
                          <option>Alta</option><option>Média</option><option>Baixa</option>
                        </select>
                        <input type="date" value={newTask.prazo} onChange={e=>setNewTask({...newTask,prazo:e.target.value})} style={inputSt} />
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>addTask(staff.id)} style={btnSt(staff.cor,staff.cor==="#f9d856"?"#000":"#fff")}>Criar</button>
                        <button onClick={()=>setShowForm(null)} style={btnSt("transparent",C.textMuted)}>×</button>
                      </div>
                    </div>
                  )}

                  {tasks.length===0?(
                    <div style={{fontSize:11,color:C.textMuted,textAlign:"center",padding:"12px 0"}}>Sem tarefas</div>
                  ):(
                    tasks.map(t=>{
                      const sc=STATUS_TASK[t.status];
                      return (
                        <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                          <select value={t.status} onChange={e=>updateTask(staff.id,t.id,{status:e.target.value})}
                            style={{background:"#0a0c14",border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:9,borderRadius:4,padding:"1px 3px",cursor:"pointer",flexShrink:0,marginTop:2}}>
                            {Object.entries(STATUS_TASK).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,color:t.status==="concluido"?C.textMuted:C.textPrimary,textDecoration:t.status==="concluido"?"line-through":"none"}}>{t.titulo}</div>
                            {t.prazo&&<div style={{fontSize:9,color:C.textMuted}}>até {fmtDate(t.prazo)}</div>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* JP quick stats */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Resumo Loja JP</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {label:"Total peças",value:"523",color:C.textPrimary},
            {label:"Disponíveis",value:"267",color:C.verde},
            {label:"Em manutenção",value:"83",color:C.red},
          ].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:10,color:C.textMuted}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:11,color:C.textMuted,textAlign:"center"}}>
          Dados do sistema meuclubkids.com.br · Atualizado 03/06/2026 · 
          <a href="#" style={{color:C.azul,textDecoration:"none",marginLeft:4}}>Módulo manutenção JP →</a>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PANEL ───────────────────────────────────────────────
function PanelView({ units, onSelectUnit }) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterContact, setFilterContact] = useState("Todos");
  const [filterCarteira, setFilterCarteira] = useState("Todos");

  const filtered = useMemo(()=>units.filter(u=>{
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.franchiseeName.toLowerCase().includes(search.toLowerCase());
    const mg = filterGroup==="Todos" || u.group===filterGroup;
    const days = u.lastContactDate?daysSince(u.lastContactDate):999;
    const thresh = GROUP_CFG[u.group]?.freq||10;
    const mc = filterContact==="Todos" || (filterContact==="Atrasado"&&days>=thresh) || (filterContact==="Em dia"&&days<thresh);
    const mk = filterCarteira==="Todos" || u.responsible===filterCarteira;
    return ms&&mg&&mc&&mk;
  }),[units,search,filterGroup,filterContact,filterCarteira]);

  return (
    <div style={{padding:"12px 14px"}}>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar unidade..." style={{...inputSt,width:"100%",maxWidth:280}} />
        {["Todos","BERÇÁRIO","G1","G2","G3","G4"].map(g=>(
          <button key={g} onClick={()=>setFilterGroup(g)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterGroup===g?C.laranja:C.cardBorder}`,
            background:filterGroup===g?`${C.laranja}22`:"transparent",
            color:filterGroup===g?C.laranja:C.textMuted,
          }}>{g}</button>
        ))}
        <button onClick={()=>setFilterContact(filterContact==="Atrasado"?"Todos":"Atrasado")} style={{
          padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
          border:`1px solid ${filterContact==="Atrasado"?C.red:C.cardBorder}`,
          background:filterContact==="Atrasado"?`${C.red}22`:"transparent",
          color:filterContact==="Atrasado"?C.red:C.textMuted,
        }}>🔴 Contato atrasado</button>
        {["Todos","Ivanise","Will"].map(k=>(
          <button key={k} onClick={()=>setFilterCarteira(k)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterCarteira===k?C.azul:C.cardBorder}`,
            background:filterCarteira===k?`${C.azul}22`:"transparent",
            color:filterCarteira===k?C.azul:C.textMuted,
          }}>{k==="Todos"?"👥 Todos":k==="Ivanise"?"🟠 Ivanise":"🔵 Will"}</button>
        ))}
      </div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>{filtered.length} de {units.length} unidades</div>

      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={{width:"100%",minWidth:520,borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.cardBorder}`}}>
              {["Unidade","Grupo","Fat. Mai/26","Meta Jun/26","Último contato","Tarefas","Resp."].map(h=>(
                <th key={h} style={{padding:"8px 10px",fontSize:9,color:C.textMuted,textAlign:"left",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>{
              const openT=(u.tasks||[]).filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
              const overdueT=openT.filter(t=>t.meetingData&&daysSince(t.meetingData)>14);
              const daysAgo=u.lastContactDate?daysSince(u.lastContactDate):null;
              return (
                <tr key={u.id} onClick={()=>onSelectUnit(u)}
                  style={{borderBottom:`1px solid ${C.cardBorder}`,cursor:"pointer",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"9px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Semaphore unit={u} />
                      <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{u.name}</span>
                      {u.group==="BERÇÁRIO"&&<span style={{fontSize:9,color:C.bercario}}>({u.daysInBercario}d)</span>}
                    </div>
                  </td>
                  <td style={{padding:"9px 8px"}}><GroupBadge group={u.group} small /></td>
                  <td style={{padding:"9px 8px",textAlign:"right"}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.textPrimary}}>{fmtBRL(u.fatMai)}</span>
                  </td>
                  <td style={{padding:"9px 8px",minWidth:90}}>
                    <div style={{fontSize:9,color:C.textMuted,marginBottom:2,display:"flex",justifyContent:"space-between"}}>
                      <span>{u.metaProgress}%</span><span>{fmtBRL(u.metaJun)}</span>
                    </div>
                    <ProgressBar pct={u.metaProgress} />
                  </td>
                  <td style={{padding:"9px 8px",textAlign:"center"}}>
                    {daysAgo===null?<span style={{fontSize:10,color:C.red}}>Sem contato</span>:
                      <span style={{fontSize:11,color:daysAgo===0?C.verde:C.textMuted}}>{daysAgo===0?"Hoje":`${daysAgo}d`}</span>}
                  </td>
                  <td style={{padding:"9px 8px",textAlign:"center"}}>
                    {openT.length>0?<span style={{fontSize:11,fontWeight:700,color:overdueT.length>0?C.red:C.textMuted}}>{openT.length}{overdueT.length>0?` ⚠️${overdueT.length}`:""}</span>:
                      <span style={{fontSize:11,color:C.cardBorder}}>—</span>}
                  </td>
                  <td style={{padding:"9px 8px"}}>
                    <span style={{fontSize:11,color:C.textMuted}}>{u.responsible}</span>
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

// ─── STATS BAR ───────────────────────────────────────────────
function StatsBar({ units }) {
  const bercarios=units.filter(u=>u.group==="BERÇÁRIO").length;
  const g1=units.filter(u=>u.group==="G1").length;
  const g2=units.filter(u=>u.group==="G2").length;
  const g3=units.filter(u=>u.group==="G3").length;
  const g4=units.filter(u=>u.group==="G4").length;
  const needContact=units.filter(u=>{
    const d=u.lastContactDate?daysSince(u.lastContactDate):999;
    return d>=(GROUP_CFG[u.group]?.freq||10);
  }).length;
  const allTasks=units.flatMap(u=>u.tasks||[]);
  const openTasks=allTasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado").length;
  const overdueTasks=allTasks.filter(t=>t.status!=="concluido"&&t.meetingData&&daysSince(t.meetingData)>14).length;

  const stats=[
    {label:"Total",value:units.length,color:C.textPrimary},
    {label:"Berçário",value:bercarios,color:C.bercario},
    {label:"G1",value:g1,color:C.laranja},
    {label:"G2",value:g2,color:C.verde},
    {label:"G3",value:g3,color:C.azul},
    {label:"G4",value:g4,color:C.red},
    {label:"S/ contato",value:needContact,color:needContact>10?C.red:C.amarelo},
    {label:"Tarefas",value:openTasks,color:overdueTasks>0?C.red:C.textMuted},
  ];

  return (
    <div style={{
      display:"flex", borderBottom:`1px solid ${C.cardBorder}`,
      overflowX:"auto", scrollbarWidth:"none", msOverflowStyle:"none",
    }}>
      {stats.map(s=>(
        <div key={s.label} style={{
          padding:"6px 12px", borderRight:`1px solid ${C.cardBorder}`,
          flexShrink:0, minWidth:52, textAlign:"center",
        }}>
          <div style={{fontSize:15,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
          <div style={{fontSize:8,color:C.textMuted,whiteSpace:"nowrap",marginTop:2}}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────
const NAV_ITEMS = [
  {id:"panel",    emoji:"📊", label:"Painel"},
  {id:"dashboard",emoji:"🏠", label:"Dashboard"},
  {id:"diario",   emoji:"📓", label:"Diário"},
  {id:"manutencao",emoji:"🔧",label:"Manutenção"},
  {id:"print3d",  emoji:"🖨️", label:"3D"},
  {id:"campanhas",emoji:"📣", label:"Campanhas"},
  {id:"inauguracao",emoji:"🐣",label:"Inaug."},

  {id:"lojajp",   emoji:"🏪", label:"Loja JP"},
];

// Groups for the nav drawer
const NAV_GROUPS = [
  { label:"Principal",   items:["panel","dashboard","diario"] },
  { label:"Operacional", items:["manutencao","print3d","lojajp"] },
  { label:"Rede",        items:["campanhas","inauguracao"] },
];

function TopBar({ activeTab, setActiveTab, dbStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = NAV_ITEMS.find(n=>n.id===activeTab);

  return (
    <>
      {/* Top bar */}
      <div style={{
        height:52, borderBottom:`1px solid ${C.cardBorder}`,
        display:"flex", alignItems:"center", padding:"0 14px",
        position:"sticky", top:0, background:C.bg, zIndex:200,
        gap:10,
      }}>
        {/* Hamburger */}
        <button onClick={()=>setMenuOpen(true)} style={{
          background:"none", border:`1px solid ${C.cardBorder}`,
          borderRadius:8, color:C.textPrimary, width:36, height:36,
          cursor:"pointer", fontSize:16, display:"flex",
          alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>☰</button>

        {/* Brand */}
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"baseline", gap:6}}>
            <span style={{fontSize:12, fontWeight:800, color:C.laranja, letterSpacing:"0.04em"}}>o clubkids</span>
            <span style={{fontSize:9, color:C.textMuted}}>Flow CRM Franquias CK</span>
            <span style={{fontSize:9, color:C.cardBorder}}>v5.0</span>
            <span style={{
              fontSize:8, padding:"1px 5px", borderRadius:10,
              background: dbStatus==="ok"?`${C.verde}22`:dbStatus==="offline"?`${C.amarelo}22`:`${C.textMuted}22`,
              color: dbStatus==="ok"?C.verde:dbStatus==="offline"?C.amarelo:C.textMuted,
              border:`1px solid ${dbStatus==="ok"?C.verde:dbStatus==="offline"?C.amarelo:C.textMuted}44`,
            }}>
              {dbStatus==="ok"?"☁️ nuvem":dbStatus==="offline"?"⚠️ local":"⏳"}
            </span>
          </div>
          {/* Current section indicator */}
          <div style={{fontSize:10, color:C.textMuted, marginTop:1}}>
            {active?.emoji} {active?.label}
          </div>
        </div>

        {/* Quick nav — most used tabs as icon buttons */}
        <div style={{display:"flex", gap:4, flexShrink:0}}>
          {["panel","dashboard","campanhas"].map(id=>{
            const n = NAV_ITEMS.find(x=>x.id===id);
            return (
              <button key={id} onClick={()=>setActiveTab(id)} style={{
                width:34, height:34, borderRadius:8, border:"none",
                background: activeTab===id ? `${C.laranja}22` : "transparent",
                color: activeTab===id ? C.laranja : C.textMuted,
                cursor:"pointer", fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>{n?.emoji}</button>
            );
          })}
        </div>
      </div>

      {/* Drawer overlay */}
      {menuOpen&&(
        <div style={{
          position:"fixed", inset:0, zIndex:500,
          display:"flex",
        }}>
          {/* Backdrop */}
          <div onClick={()=>setMenuOpen(false)} style={{
            position:"absolute", inset:0, background:"#00000088",
          }}/>

          {/* Drawer */}
          <div style={{
            position:"relative", width:260, background:C.bg,
            borderRight:`1px solid ${C.cardBorder}`,
            height:"100vh", overflowY:"auto",
            display:"flex", flexDirection:"column",
          }}>
            {/* Drawer header */}
            <div style={{
              padding:"16px 16px 12px",
              borderBottom:`1px solid ${C.cardBorder}`,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div>
                <div style={{fontSize:14, fontWeight:800, color:C.laranja}}>o clubkids</div>
                <div style={{fontSize:10, color:C.textMuted}}>Flow CRM Franquias CK</div>
              </div>
              <button onClick={()=>setMenuOpen(false)} style={{
                background:"none", border:"none", color:C.textMuted,
                fontSize:20, cursor:"pointer", padding:4,
              }}>×</button>
            </div>

            {/* Nav groups */}
            <div style={{flex:1, padding:"8px 0"}}>
              {NAV_GROUPS.map(group=>(
                <div key={group.label} style={{marginBottom:8}}>
                  <div style={{
                    padding:"6px 16px 4px",
                    fontSize:9, fontWeight:700, color:C.textMuted,
                    textTransform:"uppercase", letterSpacing:"0.08em",
                  }}>{group.label}</div>
                  {group.items.map(id=>{
                    const n = NAV_ITEMS.find(x=>x.id===id);
                    const isActive = activeTab===id;
                    return (
                      <button key={id} onClick={()=>{setActiveTab(id);setMenuOpen(false);}} style={{
                        width:"100%", padding:"10px 16px",
                        background: isActive ? `${C.laranja}18` : "transparent",
                        border:"none",
                        borderLeft: isActive ? `3px solid ${C.laranja}` : "3px solid transparent",
                        color: isActive ? C.textPrimary : C.textMuted,
                        fontWeight: isActive ? 700 : 400,
                        fontSize:13, cursor:"pointer",
                        fontFamily:"inherit", textAlign:"left",
                        display:"flex", alignItems:"center", gap:10,
                      }}>
                        <span style={{fontSize:18}}>{n?.emoji}</span>
                        <span>{n?.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer footer */}
            <div style={{
              padding:"12px 16px",
              borderTop:`1px solid ${C.cardBorder}`,
              fontSize:10, color:C.textMuted,
            }}>
              👤 Ivanise Leite · Supervisora Nacional
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
export default function FlowCRM() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("connecting");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activeTab, setActiveTab] = useState("panel");

  // Load from Supabase on mount — units + contacts + tasks
  useEffect(() => {
    async function loadAll() {
      try {
        const [rows, contacts, tasks] = await Promise.all([
          sb.get("units", "?select=*&order=name"),
          sb.get("contacts", "?select=*&order=date.desc"),
          sb.get("tasks", "?select=*&order=created_at.desc"),
        ]);
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
          setUnits(withContacts);
          setDbStatus("ok");
        } else {
          setUnits(buildUnits());
          setDbStatus("offline");
        }
      } catch (err) {
        console.warn("Supabase unavailable:", err.message);
        setUnits(buildUnits());
        setDbStatus("offline");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

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
              updated_at: new Date().toISOString(),
            });
          } catch(e) { /* ignore */ }
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
        <div style={{fontSize:36}}>🧩</div>
        <div style={{fontSize:16, fontWeight:800, color:C.laranja}}>o clubkids</div>
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
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} dbStatus={dbStatus} />
      <StatsBar units={units} />
      <div style={{maxWidth:"100%", overflowX:"hidden"}}>
        {activeTab==="panel"&&<PanelView units={units} onSelectUnit={setSelectedUnit} />}
        {activeTab==="dashboard"&&<DashboardView units={units} onSelectUnit={setSelectedUnit} />}
        {activeTab==="diario"&&<DiarioView units={units} dbStatus={dbStatus} />}
        {activeTab==="manutencao"&&<MaintenanceModule dbStatus={dbStatus} />}
        {activeTab==="print3d"&&<Print3DModule dbStatus={dbStatus} />}
        {activeTab==="campanhas"&&<CampanhasView units={units} onUpdateUnit={updateUnit} />}
        {activeTab==="inauguracao"&&<InaugurationModule units={units} />}
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
    </div>
  );
}
import { useState, useMemo, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────────────────
const SUPABASE_URL = "https://bqspprdmvludxeokcyjp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxc3BwcmRtdmx1ZHhlb2tjeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTkzMzgsImV4cCI6MjA5NjQzNTMzOH0.AgaMkfIgX4yB5rQ7M-Em5DG3_ONZAQwtKRQd_rz3utY";

const sb = {
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  },

  async get(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers: sb.headers });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: sb.headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(table, id, data, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "PATCH", headers: sb.headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async upsert(table, data, onConflict = "") {
    const url = `${SUPABASE_URL}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ""}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...sb.headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(table, id, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "DELETE", headers: sb.headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },
};

// ─── PALETTE ────────────────────────────────────────────────
const C = {
  laranja: "#f19134", rosa: "#fcccdc", azul: "#6e81bf",
  verde: "#2db870", amarelo: "#f9d856", bercario: "#8a6dd4",
  bg: "#f4edd6", card: "#ffffff", cardBorder: "#e8e0cd",
  cardHover: "#fffbf5", textPrimary: "#1a1a1a", textMuted: "#8a7e6e",
  red: "#e03535", redBg: "#fdecea",
  inset: "#faf6ef", insetBorder: "#f0e8d8",
  amareloTxt: "#a07800", rosaTxt: "#c25a82",
};

const TODAY = new Date();
const INVESTMENT = 60000;

// ─── REPASSE BERÇÁRIO ────────────────────────────────────────
const REPASSE_BERCARIO = {
  "SP - SANTOS PRAIA GRANDE": "2026-06-01",
  "CE - JUAZEIRO DO NORTE": "2026-05-24",
};

// ─── MEETINGS DATA ───────────────────────────────────────────
const MEETINGS_DATA = [
  {
    id: "m1", data: "2026-01-13", unidade: "PR - TOLEDO",
    extra: ["BA - BARREIRAS", "MG - ITUIUTABA"],
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Thiago Dalmaso, Helen, Regiane (Ituiutaba), Fernanda (Barreiras)",
    docId: "1N4QhnLF3mN_7ByXLi2yQ6xBCYL31jpKoIKmSxPJFcsI",
    resumo: "Pré-inauguração Toledo, Barreiras e Ituiutaba. Alinhamento dos 3 pilares (Operação, Vendas, Gestão), técnicas de venda consultiva, suporte nos primeiros 90 dias.",
    tarefas: [
      { titulo: "Acompanhar início operacional das 3 novas unidades", resp: "Ivanise", prioridade: "Alta" },
    ],
  },
  {
    id: "m2", data: "2026-01-15", unidade: "SP - SANTO ANDRÉ E SÃO CAETANO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Tamires Zanellato Brito",
    docId: "1kQn7-VvRIO-puAk9jFGz-zxiO-9oPfZ25XXW8ifbAjc",
    resumo: "Análise tráfego pago (ticket R$155,90). Campanha cashback 20% jan-fev. Meta: superar recorde R$4.400 de outubro.",
    tarefas: [
      { titulo: "Lançar campanha cashback 20% (20/jan–20/fev)", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Reativar parceiras em janeiro/fevereiro", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m3", data: "2026-02-11", unidade: "PR - TOLEDO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Thiago Dalmaso",
    docId: "1E1kcdb38otf0Gr46jOiKfQz8t-6bTA7jT7oZB_gxxk0",
    gravacao: "https://drive.google.com/file/d/1AfqZ2esTBHTBb6YL6jbGTol5hL3fdjoOAF2t8Q/view",
    resumo: "Balanço 1º mês positivo. Mamaru com alta demanda (3ª locação seguida). Estratégia jumper com influencer. Recomendação de berço portátil para viajantes.",
    tarefas: [
      { titulo: "Enviar jumper para influencer e registrar como 'alugado' no sistema", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Adquirir berço portátil para atender demanda de viajantes", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m4", data: "2026-04-17", unidade: "MG - CATAGUASES",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Ruth Rocha",
    docId: "1pplwqH0Dwyc-BzW3QXxxeMqnxyiGJQqCTVoM8bsptIs",
    gravacao: "https://drive.google.com/file/d/1BrI99D4liuDiUJ0b9ofQeqkm7-1ykCk/view",
    resumo: "Ajuste campanhas tráfego pago — foco em gestantes e 0-12 meses. Novo criativo educativo mais eficaz. Avaliação de compra de mais 1 Mamaru.",
    tarefas: [
      { titulo: "Enviar vídeos de ideias de conteúdo para Ruth", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Verificar novos produtos para 3-5 meses com Mari", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar lista itens recomendados + cercado menor", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Informar Ruth sobre novo fornecedor", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Revisar prints campanha enviados por Ruth", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Focar campanhas em Mamaru / gestantes 0-12m", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Avaliar compra de mais 1 Mamaru", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Enviar prints da campanha ativa para Ivanise", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m5", data: "2026-04-23", unidade: "PE - RECIFE 1 IMBIRIBEIRA",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Micheli Santos",
    docId: "11L1CiyYbOKSZNgZIEkOKKR8vrp-6rRrVivWbhsgialo",
    gravacao: "https://drive.google.com/file/d/1OL3hLoJOdDTYg36HNXRuCcUxqUrHOVnq/view",
    resumo: "6 parceiras ativas gerando resultados. Novo critério: foco em produção de conteúdo vs. nº de seguidores. Reels com maior alcance. Ajuste para 5-7 stories/dia.",
    tarefas: [
      { titulo: "Analisar stories e orientar sobre engajamento qualificado", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Testar nova frequência de 5-7 stories/dia", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Inibir itens alugados no app em vez de ajuste manual de estoque", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Implementar aumento de R$10 na extratora hands-free e monitorar reação", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m6", data: "2026-05-05", unidade: "RS - TORRES",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Michele Cogo",
    docId: "1iS1Tr0wC3Srv1_wW36HgMJRbCGUk4gXachTBl9jFjVc",
    resumo: "Reestruturação completa: prospecção ativa, parcerias locais, autoridade digital. Meta: 6 novas parcerias, 10 prospecções/dia.",
    tarefas: [
      { titulo: "Enviar editorial + cronograma + roteiros Instagram", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar passo a passo Status WhatsApp", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Contatar Luu_kuhn e Vem pra Torres para parcerias de permuta", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Verificar modelos alternativos de assentos com fornecedores", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Passar contato da Estela para resolver pendência Bum Bag Criativa", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Produzir 2 vídeos semanais seguindo roteiros estratégicos", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Configurar catálogo WhatsApp com fotos humanizadas e sem preços fixos", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Status WhatsApp 2x/dia", resp: "Franqueado", prioridade: "Média" },
      { titulo: "10 prospecções diárias (5 Instagram + 5 networking)", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Fechar 6 novas parcerias estratégicas", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m7", data: "2026-05-06", unidade: "CE - FORTALEZA FÁTIMA",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "David Dias",
    docId: "1egtf3NBFg7-GI-UTaXiSp3xT7Umb1g3yPGsia1Z2-mE",
    resumo: "Alinhamento operacional completo. Fluxo WhatsApp, pós-venda estruturado, campanhas sazonais, Instagram. Equipe: Júlia (WPP), Eduana (sistema), Bruno (prospecção).",
    tarefas: [
      { titulo: "Adicionar Júlia, Eduana e Bruno no grupo de suporte da unidade", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Adicionar equipe no grupo de manutenção da rede", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Definir fluxo operacional campanhas com dias extras de aluguel", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Compartilhar acesso da pasta Drive da unidade Fortaleza", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar manual + cronograma de conteúdo Instagram", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar material fluxo pós-venda obrigatório", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Monitorar aniversariantes diariamente no sistema", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Atualizar corretamente motivos de manutenção no sistema", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Pesquisar brinquedos antes de cada contato de renovação", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m8", data: "2026-05-12", unidade: "MG - UBERLÂNDIA",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "ClubKids Uberlândia",
    docId: "1v4HJTfS26OTWM6ZuRYgq7Sh0AQYNVFdepvF8ASeCQ-s",
    gravacao: "https://drive.google.com/file/d/163C5z5XQlQry9kktWNK6FjFxzFhk6bIg/view",
    resumo: "Implementação CRM Scale (WhatsApp). Reativação de inativos e prospecção Instagram. Parcerias hotéis e Airbnb. Automação mensagens de renovação.",
    tarefas: [
      { titulo: "Enviar cronograma conteúdo junho + link ferramenta de automação", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar tutorial prospecção ativa Instagram", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Agendar treinamento Web WhatsApp", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Programar Instagram semanal", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Configurar respostas rápidas + chave Pix WhatsApp Business", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Cobrar gerente de hotel sobre proposta de parceria", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Prospectar 3 hotéis/pousadas para parcerias", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Configurar Web WhatsApp para atendimento ágil", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Exportar planilha clientes mensalmente para ações com IA", resp: "Franqueado", prioridade: "Média" },
      { titulo: "10 contatos diários de prospecção no Instagram", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m9", data: "2026-05-13", unidade: "PR - TOLEDO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Thiago Dalmaso",
    docId: "1QfXE1Onvhk1Rsfd2UY1UWyeWh6u72Zn7u29UmISZU14",
    resumo: "Foco em conversão: etiquetas WhatsApp, follow-up diário, substituição de desconto por valor agregado (dias extras), 10 prospecções/dia Instagram.",
    tarefas: [
      { titulo: "Analisar histórico conversas sincronizadas Toledo", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Avaliar situação clientes de Cascavel e estratégias recuperação", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar arte com QR Code para parcerias presenciais", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar sugestões temas conteúdo regionalizado Toledo", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Revisar abordagem clientes esquecidos da base Toledo", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Criar etiquetas WhatsApp (Em atend./Aguardando/Pós-venda/Renovação)", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Stories sobre disponibilidade cadeira Mamaru", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Follow-up diário dos leads classificados nas etiquetas", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "10 prospecções diárias Instagram", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Estratégia valor agregado: dias extras de aluguel em vez de desconto", resp: "Franqueado", prioridade: "Média" },
    ],
  },
  {
    id: "m10", data: "2026-05-15", unidade: "SP - OSASCO",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Andressa Máximo",
    docId: "1IBnbmFW5Udx3RvuGoDC4CBPIEI4NVgQDs9N5BL0i7-o",
    resumo: "Revisão estratégica: jumpers via influenciadoras gerando ótimo resultado. Pausa tráfego pago para fortalecer orgânico (mentoria Jamile Passo). Reativação RFV.",
    tarefas: [
      { titulo: "Enviar análise completa do perfil Instagram Osasco", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar sugestões temas stories + roteiros séries educacionais", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar material editorial de posts para a rede", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Enviar tutorial RFV no sistema de gestão", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Adicionar geolocalização cidade/bairros em posts, Reels e stories", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Incluir CTAs incentivando compartilhamento via direct", resp: "Franqueado", prioridade: "Média" },
      { titulo: "Baixar planilha RFV e abordar clientes por segmento", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m11", data: "2026-05-21", unidade: "SC - JARAGUÁ DO SUL",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Fabrício Alves + Amanda Galli",
    docId: "12L8nhsPH-ZxKPwHFMrRNHxHonx-Gkm_AEUe5LbAw9_I",
    gravacao: "https://drive.google.com/file/d/1yASlSp4WjvEh8taYFnEJfR6vIuKje-3r/view",
    resumo: "Crescimento sustentado. Tráfego pago R$50-55/sem (2.600→3.000 seguidores). Campanha Dia das Mães 40% foi bem-sucedida. Foco em segmentação RFV e microinfluenciadores.",
    tarefas: [
      { titulo: "Enviar formulário preparatório antes da próxima reunião Jaraguá", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Verificar divergência de faturamento no dashboard do sistema", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Enviar sugestões de temas e ganchos para criação de conteúdo", resp: "Ivanise", prioridade: "Média" },
      { titulo: "Testar Google Ads por 1 semana e avaliar impacto", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Elevar para 5-7 stories/dia com geolocalização e ganchos fortes", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Segmentar contatos via RFV para identificar inativos", resp: "Franqueado", prioridade: "Alta" },
      { titulo: "Buscar microinfluenciadores ~4k seguidores + verificar localização nos perfis", resp: "Franqueado", prioridade: "Alta" },
    ],
  },
  {
    id: "m12", data: "2026-05-25", unidade: "REDE",
    tipo: "Reunião (Meet)", responsavel: "Ivanise",
    franqueado: "Luiz Maskow (convidado especial)",
    docId: "1BIUfPy8gaazphBWL__8aBr2w9CKNM2UGx6ExFUrZd7I",
    gravacao: "https://drive.google.com/file/d/1VRAVGsMl5-PcG2xprs4kuF1eiEt5X716/view",
    resumo: "Conexão CK Maio/2026 — Instagram que vende. Funil atração/relacionamento/conversão. Reels priorizados. Anúncios segmentados + atendimento humanizado.",
    tarefas: [
      { titulo: "Compartilhar material de reaproveitamento de conteúdos com o grupo", resp: "Ivanise", prioridade: "Alta" },
      { titulo: "Disponibilizar ata na universidade corporativa", resp: "Ivanise", prioridade: "Média" },
    ],
  },
];

// ─── JP MAINTENANCE DATA ─────────────────────────────────────
const JP_MANUTENCAO_INICIAL = [
  "Assento Multifuncional 3 Estágios - INFANTINO","Mini Berço Baby Hug 4 em 1 - CHICCO",
  "Centro de Atividades Around We Go - BRIGHT STARTS","Centro de Atividades Bounce Baby Sapinho - BRIGHT STARTS",
  "Cercado Animado - FIRST STEPS","Lousa Infantil 2 em 1 com Cadeirinha - LOUSA KIDS",
  "Cadeira Basculante Elefantinho - MASTELA","Cadeira Basculante Elefantinho - MASTELA",
  "Centro de Atividades - INFANTINO","Monitor Cardíaco Fetal Pocket - DOPPLER",
  "Babá Eletrônica - CLINGO","Cercado Animado - FIRST STEPS",
  "Assento Selva - INFANTINO","Centro Step N Play Piano - FISHER PRICE",
  "Apoiador Passeio e Descoberta - VTECH","Escorregador cachorrinho com balanço - ALPHA",
  "Centro de Atividades Explore & More - SKIP HOP","Cercado Animado - FIRST STEPS",
  "Jumperoo Viagem e Descoberta - BABY EINSTEIN","Centro de Atividades Around We Go - BRIGHT STARTS",
  "Gangorra Infantil Pikler - BEBRINQUÊ","Carrinho de Passeio Pocket - GB",
  "Jumperoo Pink Petals - FISHER PRICE","Jardim de Atividades - LITTLE TIKES",
  "Moto King Rider Elétrica 12V Preta - BANDEIRANTE","Carrinho de Passeio Delta - VOYAGE",
  "Trave Dupla - XALINGO","Jardim de Atividades - LITTLE TIKES",
  "Triciclo Smart Plus - BANDEIRANTE","Jeep Wrangler Elétrico 12V Laranja - BANDEIRANTE",
  "Escorregador Splash 3 Degraus - BANDEIRANTE","Carrinho Jipe Rosa - CALESITA",
  "Jumperoo Tiger Time - FISHER PRICE","Caminhão Brutus Construtor Pedal - BANDEIRANTE",
  "Cercado Dino - LE PETIT","Maserati Elétrica 12V Azul Com Controle - BANDEIRANTE",
  "Carrinho Smart Banjipe Passeio e Pedal Camuflado - BANDEIRANTE","Cercado Animado - FIRST STEPS",
  "Cercado Animado - FIRST STEPS","Cercado Animado - FIRST STEPS",
  "Jaguar Elétrico 12V Branco - BANDEIRANTE","Super Banjipe - Reclinável com Capota - Preto - BANDEIRANTE",
  "Super Banjipe - Reclinável com Capota - Preto - BANDEIRANTE","Cadeira Vibratória Coelhinho - INGENUITY",
  "Massageador de Seios + Aquecedores - FRIDA MOM","Mesa de Atividades Laugh & Learn - FISHER PRICE",
  "Bomba Extratora Swing Maxi Dupla - MEDELA","Cama Elástica Quadrada - TOIN TOIN",
  "Assento de Alimentação Luv U Zoo - FISHER PRICE","Playground Infantil Dupla Diversão - LITTLE TIKES",
  "Mercedes Titanium Elétrica 12V - BANDEIRANTE","Bomba Extratora Swing Dupla - MEDELA",
  "Apoiador Ferramenta - JANOD","Berço Hello Cinza - INFANTI",
  "Jumper Joyful Centro de Atividades 360° - INFANTI","Cama Elástica Quadrada - TOIN TOIN",
  "Cadeira Basculante Elefantinho - MASTELA","Berço Hello Cinza - INFANTI",
  "Centro Step N Play Piano - FISHER PRICE","Piscina de Bolinhas - LACUCA",
  "Berço Hello Cinza - INFANTI","Quadriciclo Elétrico 12V Vermelho - BANDEIRANTE",
  "Tapete Piano - BABY EINSTEIN","Kart Elétrico - BANDEIRANTE",
  "Berço Desmontável Azul - INFANTI","Assento Bumbo Multi - Azul - BUMBO",
  "Cama Elástica Quadrada - TOIN TOIN","Cadeira Moisés Multi-Motion - MASTELA",
  "Cercado Animado - FIRST STEPS","Vespa Branca 12V - BANDEIRANTE",
  "Audi RS Q E-Tron Elétrico Grafite 24V - BANDEIRANTE","Lambreta Elétrica 6V Hello Kitty - BANDEIRANTE",
  "Monitor Cardíaco Fetal Pocket - DOPPLER","Carrinho de Passeio - ABC DESIGN",
  "Assento Sit Me Up Sapinho Azul - FISHER PRICE","Cadeira Basculante Sorvete - MASTELA",
  "Jumperoo Tiger Time - FISHER PRICE","Babá Eletrônica - CLINGO",
  "Cadeira Vibratória Bichinhos Animados - FISHER PRICE","Assento azul com Bandeja - BUMBO",
  "Berço Desmontável Toybar Rosa - COSCO","Monitor Cardíaco Fetal - DOPPLER",
  "Cadeira de Balanço New Mamaroo 5.0 Gray - 4MOMS",
].map((nome, i) => ({
  id: i + 1, nome, status: "aguardando_orcamento",
  dataEntrada: null, motivo: "", orcamentoValor: "", orcamentoLink: "",
  aprovacao: "pendente", dataAprovacao: null,
  dataEnvio: null, dataChegada: null, dataManutencao: null, dataRetorno: null,
  enviadoPara: [], responsavel: "Will", observacoes: "",
}));

// ─── UNITS DATA ───────────────────────────────────────────────
const RAW_UNITS = [
  ["PB - JOÃO PESSOA",27494.95,40000,"2015-05-11",29647.07,24750.72],
  ["SP - PINHEIROS E BUTANTÃ",5551.60,5000,"2024-02-26",1841.23,1315.01],
  ["SP - VILA ANDRADE E CENTRO",3006.24,3500,"2024-01-12",2288.43,3052.95],
  ["AC - RIO BRANCO",6618.34,7500,"2020-08-24",7588.70,6942.28],
  ["AL - ARAPIRACA",639.10,2500,"2026-02-12",0,1725.30],
  ["AP - MACAPÁ",10228.38,11000,"2022-12-16",9079.45,8897.68],
  ["BA - BARREIRAS",2186.80,3500,"2026-01-15",2723.93,2108.29],
  ["BA - FEIRA DE SANTANA",950.60,2500,"2023-12-01",1407.37,1381.65],
  ["BA - ITABUNA",1366.70,2500,"2025-09-26",1940.58,1373.66],
  ["BA - LAURO DE FREITAS",1298.63,2500,"2024-04-27",716.95,571.00],
  ["BA - SALVADOR",1161.94,2500,"2024-02-04",1216.96,529.97],
  ["BA - VITÓRIA DA CONQUISTA",3070.78,4000,"2023-09-06",3819.13,2206.30],
  ["CE - AQUIRAZ E EUSEBIO",2515.52,3500,"2024-05-17",2169.37,3159.83],
  ["CE - FORTALEZA FÁTIMA",1582.50,2500,"2025-03-07",302.72,1426.98],
  ["CE - FORTALEZA MEIRELES",10825.00,10500,"2023-06-17",9501.88,8697.60],
  ["CE - JUAZEIRO DO NORTE",1775.74,2500,"2024-07-15",406.10,1900.58],
  ["ES - VITÓRIA",2565.10,2500,"2024-04-04",1582.76,1437.23],
  ["GO - ANÁPOLIS",1320.80,2500,"2025-03-21",1161.15,939.20],
  ["GO - APARECIDA DE GOIÂNIA",1153.75,2500,"2025-03-21",981.20,930.80],
  ["GO - GOIÂNIA",14852.62,16500,"2021-08-14",14524.11,17136.65],
  ["GO - RIO VERDE",4827.15,5500,"2024-12-19",4393.08,4852.22],
  ["MA - SÃO LUÍS",2892.83,3500,"2024-04-10",2794.70,3724.68],
  ["MG - BH PAMPULHA",6532.60,6500,"2025-10-03",5537.51,7212.13],
  ["MG - BH SAVASSI",1723.58,2000,"2026-01-29",728.32,1474.42],
  ["MG - CATAGUASES",1037.51,2500,"2025-08-29",714.02,388.60],
  ["MG - DIVINÓPOLIS",674.25,2500,"2024-09-14",929.40,565.46],
  ["MG - IPATINGA",2578.61,3500,"2025-07-14",4226.43,3133.97],
  ["MG - ITUIUTABA",3576.18,4500,"2026-01-20",2759.51,3377.32],
  ["MG - JUIZ DE FORA",1141.86,2500,"2025-11-05",1186.49,1700.75],
  ["MG - MANHUAÇU",446.18,2500,"2025-09-12",1617.80,1081.84],
  ["MG - NOVA SERRANA",1194.68,2500,"2025-08-08",1494.10,932.50],
  ["MG - UBERLÂNDIA",1851.05,2500,"2025-03-21",1783.60,1969.10],
  ["MG - VIÇOSA",1791.50,2500,"2025-06-27",1118.50,2459.70],
  ["MS - CAMPO GRANDE",1158.00,2500,"2022-10-29",152.00,0],
  ["MS - DOURADOS",330.00,2500,"2023-10-10",740.00,681.00],
  ["MT - CUIABÁ",3344.25,4000,"2024-10-15",3781.28,5002.77],
  ["MT - RONDONÓPOLIS",2164.25,2500,"2025-05-16",1879.64,2362.40],
  ["PA - BELÉM",9702.96,10500,"2024-05-11",10000.70,9132.08],
  ["PA - ITAITUBA",4419.06,5500,"2024-07-06",6633.15,4079.69],
  ["PB - SOUSA E ALTO SERTÃO",1016.40,2500,"2025-10-30",987.70,855.60],
  ["PB - CAMPINA GRANDE",7231.08,8500,"2018-05-14",8113.75,4408.32],
  ["PB - GUARABIRA E BREJO",149.00,2500,"2023-07-15",486.25,711.51],
  ["PB - PATOS",754.35,2500,"2021-01-25",918.15,1289.27],
  ["PB - SANTA RITA E BAYEUX",778.00,2500,"2023-01-21",515.07,464.15],
  ["PE - JABOATÃO CANDEIAS",452.72,2500,"2025-09-26",149.00,685.60],
  ["PE - GARANHUNS",385.70,2500,"2020-10-01",2163.05,1308.80],
  ["PE - RECIFE 1 IMBIRIBEIRA",4677.54,5500,"2024-12-06",4510.69,5249.58],
  ["PE - RECIFE 2 BOA VIAGEM",2573.70,3500,"2024-05-18",2235.65,1344.50],
  ["PI - TERESINA JÓQUEI",8507.24,9500,"2024-11-15",10614.40,10674.13],
  ["PR - CASCAVEL",13520.79,14500,"2023-06-24",11371.13,12907.09],
  ["PR - CURITIBA AHÚ",9440.40,10500,"2023-09-02",10118.18,10130.18],
  ["PR - CURITIBA BATEL",18206.33,19000,"2023-04-10",17430.72,18090.42],
  ["PR - FOZ DO IGUAÇU",8024.41,8500,"2024-05-04",6314.24,7322.12],
  ["PR - LONDRINA",2688.20,3000,"2024-10-04",2757.14,2526.90],
  ["PR - MARINGÁ",2407.55,2500,"2025-11-24",1074.14,1511.35],
  ["PR - PONTA GROSSA",1856.72,2500,"2026-05-04",0,0],
  ["PR - SÃO JOSÉ DOS PINHAIS",5288.86,6000,"2024-08-15",5337.55,5589.23],
  ["PR - TOLEDO",2121.19,2500,"2026-01-15",1508.73,2217.58],
  ["RJ - NOVA IGUAÇU",0,2500,"2025-07-25",698.08,323.28],
  ["RJ - BARRA DA TIJUCA",2590.00,2500,"2024-07-27",1985.80,1616.32],
  ["RJ - ILHA DO GOVERNADOR",976.50,2500,"2025-08-29",667.19,314.50],
  ["RJ - NITERÓI",2956.06,3500,"2023-08-05",4323.33,2319.37],
  ["RJ - RESENDE",1283.74,2500,"2024-03-30",1168.00,929.24],
  ["RJ - RIO MARACANÃ",297.30,2500,"2026-02-27",938.90,693.94],
  ["RJ - SÃO GONÇALO",338.06,2500,"2025-08-29",396.16,0],
  ["RJ - VOLTA REDONDA",1803.84,2500,"2024-12-02",1037.90,997.50],
  ["RN - MOSSORÓ",3973.93,4500,"2019-05-20",4605.61,4689.69],
  ["RN - NATAL",1654.30,2500,"2018-03-19",2533.98,1635.48],
  ["RO - PORTO VELHO",9544.31,10000,"2025-11-07",7193.24,9305.87],
  ["RR - BOA VISTA",15510.68,16500,"2025-04-01",20884.38,18030.69],
  ["RS - PELOTAS",406.00,2500,"2025-05-30",606.04,947.13],
  ["RS - IJUÍ",1517.16,2500,"2026-01-29",1419.75,2328.72],
  ["RS - TORRES",134.25,2500,"2025-12-22",0,179.00],
  ["SC - BLUMENAU",3464.16,4000,"2024-06-01",3163.54,3493.87],
  ["SC - CHAPECÓ",8034.46,9000,"2024-12-06",8105.57,10284.16],
  ["SC - JARAGUÁ DO SUL",3307.85,4500,"2025-04-03",4859.34,5445.62],
  ["SC - JOINVILLE",3579.56,4500,"2024-10-10",5347.35,4623.04],
  ["SC - SÃO JOSÉ PALHOÇA",2775.60,3500,"2024-11-22",3353.40,4101.18],
  ["SE - ARACAJU",1816.93,3000,"2024-11-15",3672.28,3283.65],
  ["SP - PINDAMONHANGABA",146.30,2500,"2025-07-14",173.80,473.90],
  ["SP - IPIRANGA E MOOCA",2861.74,3000,"2025-03-21",1583.50,1852.80],
  ["SP - GUARULHOS CECAP",958.16,2500,"2025-08-29",289.00,819.94],
  ["SP - AMERICANA",3887.39,4500,"2025-10-31",2350.46,2711.24],
  ["SP - ARARAQUARA",3540.50,4000,"2023-11-01",2875.25,2995.00],
  ["SP - BARUERI E SANTANA",6684.40,5000,"2024-04-15",8063.05,8335.33],
  ["SP - CAMPINAS CAMBUÍ",1711.87,2500,"2025-03-21",2454.11,2987.74],
  ["SP - INDAIATUBA",1528.78,2500,"2025-08-08",2715.48,968.90],
  ["SP - JAÚ",538.34,2500,"2025-01-24",941.59,1106.77],
  ["SP - MARÍLIA",1503.30,2500,"2024-04-04",1185.90,1727.20],
  ["SP - MOGI DAS CRUZES",1999.78,2500,"2024-07-15",861.30,1838.23],
  ["SP - OSASCO",2661.54,3000,"2025-11-15",1734.25,1761.94],
  ["SP - PAULÍNIA",699.97,2500,"2025-07-11",663.56,770.24],
  ["SP - PIRACICABA",274.00,2500,"2024-12-19",826.88,383.30],
  ["SP - RIBEIRÃO PRETO",1187.00,2500,"2025-05-19",1355.46,2357.02],
  ["SP - SANTO ANDRÉ E SÃO CAETANO",2403.14,3000,"2024-07-06",3300.95,2929.58],
  ["SP - SANTOS PRAIA GRANDE",9583.88,10500,"2024-02-01",11227.10,9844.38],
  ["SP - SÃO JOSÉ DOS CAMPOS",3416.30,4000,"2022-10-05",6009.05,3725.60],
  ["SP - SOROCABA VOTORANTIM",624.45,2500,"2024-08-01",669.71,485.15],
  ["TO - ARAGUAÍNA",3966.90,4500,"2023-03-31",4807.60,3379.40],
  ["TO - PALMAS",4484.14,5500,"2024-05-18",6259.00,5220.78],
];

// ─── HELPERS ─────────────────────────────────────────────────
const daysSince = (d) => Math.floor((TODAY - new Date(d)) / 86400000);
const fmtBRL = (n) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n||0);
const fmtDate = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
const fmtDateShort = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}`; };

function getGroup(fat, inaug, name) {
  if (REPASSE_BERCARIO[name] && daysSince(REPASSE_BERCARIO[name]) < 120) return "BERÇÁRIO";
  if (daysSince(inaug) < 120) return "BERÇÁRIO";
  if (fat >= 8000) return "G1";
  if (fat >= 4700) return "G2";
  if (fat >= 3500) return "G3";
  return "G4";
}

const GROUP_CFG = {
  "BERÇÁRIO": { color: C.bercario, bg: "#f0ebff", label: "🐣 Berçário", freq: 2, freqLabel: "Diário" },
  G1: { color: C.laranja, bg: "#fff3e6", label: "🏆 G1 Líder", freq: 35, freqLabel: "Mensal" },
  G2: { color: C.verde, bg: "#e8f5ee", label: "🔥 G2 Aceleração", freq: 35, freqLabel: "Mensal" },
  G3: { color: C.azul, bg: "#eaeffa", label: "📈 G3 Potencial", freq: 10, freqLabel: "Semanal" },
  G4: { color: C.red, bg: "#fdecea", label: "⚠️ G4 Crítica", freq: 10, freqLabel: "Semanal" },
};

const STATUS_TASK = {
  "nao_iniciado": { label: "Não iniciado", color: C.textMuted, dot: "○" },
  "em_andamento": { label: "Em andamento", color: C.azul, dot: "◑" },
  "concluido": { label: "Concluído", color: C.verde, dot: "●" },
  "pendente": { label: "Pendente", color: C.amareloTxt, dot: "◐" },
  "cancelado": { label: "Cancelado", color: C.textMuted, dot: "—" },
};

const STATUS_MANUT = {
  "aguardando_orcamento": { label: "Aguardando orçamento", color: C.amareloTxt },
  "orcamento_enviado": { label: "Orçamento enviado", color: C.azul },
  "aguardando_aprovacao": { label: "Aguardando aprovação", color: C.amareloTxt },
  "aprovado": { label: "Aprovado", color: C.verde },
  "aguardando_peca": { label: "Aguardando peça/envio", color: C.laranja },
  "em_manutencao": { label: "Em manutenção", color: C.laranja },
  "pronto": { label: "Pronto para retornar", color: C.verde },
  "retornou": { label: "Retornou ao estoque", color: C.textMuted },
};

// ─── CAMPAIGN DEFINITIONS ────────────────────────────────────
const CAMPAIGNS_DATA = [
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

function getCampanhasForUnit(unitName) {
  const estado = unitName.split(" - ")[0];
  const isNE = NE_STATES.includes(estado);
  const camps = ["copa_junho"];
  if (isNE) camps.push("sao_joao_ne");
  else camps.push("inverno_br");
  camps.push("ferias_julho");
  return camps;
}

// Build units from Supabase data
const buildUnitsFromDB = (rows) => rows.map((u) => {
  const days = daysSince(u.inaug);
  const group = getGroup(u.fat_mai, u.inaug, u.name);
  const avgTri = ((u.fat_mar||0) + (u.fat_abr||0) + (u.fat_mai||0)) / 3;
  const bercStart = REPASSE_BERCARIO[u.name] || u.inaug;
  const bercDaysUsed = daysSince(bercStart);
  const daysInBercario = group === "BERÇÁRIO" ? 120 - bercDaysUsed : null;
  const isRepasse = !!REPASSE_BERCARIO[u.name];
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
    dataCadastro: u.data_cadastro || "", isRepasse: u.is_repasse ?? isRepasse,
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
const buildUnits = () => RAW_UNITS.map(([name, fatMai, metaJun, inaug, fatMar, fatAbr], idx) => {
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

// ─── SHARED COMPONENTS ───────────────────────────────────────
function Semaphore({ unit }) {
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

function GroupBadge({ group, small }) {
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

function ProgressBar({ pct, color, height=4 }) {
  const c = Math.min(pct,100);
  const col = color || (pct>=100?C.verde:pct>=70?C.amarelo:C.red);
  return (
    <div style={{width:"100%",height,borderRadius:2,background:"#ece4d2",overflow:"hidden"}}>
      <div style={{width:`${c}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.4s"}} />
    </div>
  );
}

const labelSt = {fontSize:10,color:C.textMuted,display:"block",marginBottom:4,
  textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600};
const inputSt = {width:"100%",padding:"8px 12px",background:C.inset,
  border:`1px solid ${C.cardBorder}`,borderRadius:8,color:C.textPrimary,
  fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
const btnSt = (bg,color="#fff") => ({
  padding:"8px 16px",borderRadius:8,background:bg,border:"none",
  color,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",
});

// ─── TASK ROW ─────────────────────────────────────────────────
function TaskRow({ task, onUpdate, compact }) {
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

// ─── UNIT DETAIL PANEL ────────────────────────────────────────
function UnitDetail({ unit, onClose, onUpdate, allMeetings }) {
  const [tab, setTab] = useState("overview");
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newTask, setNewTask] = useState({ titulo:"",responsavel:"Ivanise",prioridade:"Alta",status:"nao_iniciado",observacao:"" });
  const [newContact, setNewContact] = useState({ date:TODAY.toISOString().slice(0,10),tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gravacaoLink:"" });
  const [localUnit, setLocalUnit] = useState(unit);

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
    if(!newTask.titulo.trim()) return;
    updateLocal({
      tasks:[...(localUnit.tasks||[]),{
        ...newTask, id:`manual_${Date.now()}`,
        meetingId:null, meetingData:TODAY.toISOString().slice(0,10),
      }]
    });
    setNewTask({titulo:"",responsavel:"Ivanise",prioridade:"Alta",status:"nao_iniciado",observacao:""});
    setShowNewTask(false);
  }

  function addContact() {
    if(!newContact.resumo.trim()) return;
    const updated = {
      ...localUnit,
      contacts:[{...newContact,id:`c_${Date.now()}`,...(localUnit.contacts||[])?.slice(-99)},...(localUnit.contacts||[])],
      lastContactDate: newContact.date,
      lastContactType: newContact.tipo,
    };
    setLocalUnit(updated);
    onUpdate(updated);
    setNewContact({date:TODAY.toISOString().slice(0,10),tipo:"WhatsApp",responsavel:"Ivanise",resumo:"",docLink:"",gravacaoLink:""});
    setShowNewContact(false);
  }

  const TABS = [
    {id:"overview",label:"Visão Geral"},
    {id:"tasks",label:`Tarefas (${openTasks.length}${overdueTasks.length>0?` ⚠️${overdueTasks.length}`:""})`},
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
            <button onClick={()=>setShowNewContact(true)} style={btnSt(C.laranja)}>+ Registrar contato</button>
            <button onClick={()=>setShowNewTask(true)} style={{...btnSt(C.inset,C.textPrimary),border:`1px solid ${C.cardBorder}`}}>+ Nova tarefa</button>
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

          {/* OVERVIEW */}
          {tab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Progress */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:6}}>Progresso — Meta Jun/26</div>
                <ProgressBar pct={localUnit.metaProgress} height={6} />
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:10,color:C.textMuted}}>Maio: {fmtBRL(localUnit.fatMai)}</span>
                  <span style={{fontSize:10,color:localUnit.metaProgress>=100?C.verde:C.laranja,fontWeight:700}}>{localUnit.metaProgress}%</span>
                  <span style={{fontSize:10,color:C.textMuted}}>Meta: {fmtBRL(localUnit.metaJun)}</span>
                </div>
              </div>

              {/* Trimester */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:8}}>Histórico trimestral</div>
                <div style={{display:"flex",gap:8}}>
                  {[["Mar/26",localUnit.fatMar],["Abr/26",localUnit.fatAbr],["Mai/26",localUnit.fatMai]].map(([l,v])=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{fmtBRL(v)}</div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{l}</div>
                      <div style={{marginTop:4}}><ProgressBar pct={localUnit.metaJun>0?(v/localUnit.metaJun)*100:0} color={C.azul} /></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[
                  {label:"Investimento",value:fmtBRL(localUnit.investment),color:C.textMuted},
                  {label:"ROI acumulado est.",value:`${localUnit.roiAccum}%`,color:localUnit.roiAccum>=100?C.verde:C.laranja},
                  {label:"Meses p/ payback",value:localUnit.paybackLeft!==null?`~${localUnit.paybackLeft}m`:"—",color:C.azul},
                ].map(s=>(
                  <div key={s.label} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:C.textMuted,marginBottom:3}}>{s.label}</div>
                    <div style={{fontSize:15,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Pending tasks preview */}
              {openTasks.length>0&&(
                <div style={{background:C.card,border:`1px solid ${overdueTasks.length>0?"#ef444433":C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontSize:11,color:C.textMuted}}>Tarefas em aberto ({openTasks.length}){overdueTasks.length>0&&<span style={{color:C.red}}> · {overdueTasks.length} vencidas</span>}</div>
                    <button onClick={()=>setTab("tasks")} style={{background:"none",border:"none",color:C.azul,fontSize:11,cursor:"pointer"}}>Ver todas →</button>
                  </div>
                  {openTasks.slice(0,4).map(t=>(
                    <TaskRow key={t.id} task={t} onUpdate={updateTask} compact />
                  ))}
                </div>
              )}

              {/* Contact info */}
              <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>Contato e responsável</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div>
                    <label style={labelSt}>Nome do franqueado</label>
                    <input value={localUnit.franchiseeName} onChange={e=>updateLocal({franchiseeName:e.target.value})} placeholder="Nome completo" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>WhatsApp</label>
                    <input value={localUnit.whatsapp} onChange={e=>updateLocal({whatsapp:e.target.value})} placeholder="(XX) XXXXX-XXXX" style={inputSt} />
                  </div>
                  <div>
                    <label style={labelSt}>Responsável CRM</label>
                    <select value={localUnit.responsible} onChange={e=>updateLocal({responsible:e.target.value})} style={inputSt}>
                      <option>Ivanise</option><option>Will</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelSt}>Freq. contato</label>
                    <div style={{padding:"8px 12px",background:C.inset,border:`1px solid ${C.cardBorder}`,borderRadius:8,fontSize:13,color:cfg.color,fontWeight:600}}>
                      {cfg.freqLabel}
                    </div>
                  </div>
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
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addTask} style={btnSt(C.azul)}>Criar</button>
                    <button onClick={()=>setShowNewTask(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
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
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addContact} style={btnSt(C.laranja)}>Salvar</button>
                    <button onClick={()=>setShowNewContact(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
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
        </div>
      </div>
    </div>
  );
}

// ─── MAINTENANCE MODULE (JP) ──────────────────────────────────
function MaintenanceModule({ dbStatus }) {
  const [items, setItems] = useState(JP_MANUTENCAO_INICIAL);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({nome:"",motivo:"",status:"aguardando_orcamento",responsavel:"Will"});

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("manutencao", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) setItems(rows.map(r => ({
        id: r.id, nome: r.nome, motivo: r.motivo, status: r.status,
        responsavel: r.responsavel, orcamentoLink: r.orcamento_link||"",
        orcamentoValor: r.orcamento_valor||"", aprovacao: r.aprovacao||"pendente",
        dataEntrada: r.data_entrada, dataAprovacao: r.data_aprovacao,
        dataEnvio: r.data_envio, dataChegada: r.data_chegada,
        dataManutencao: r.data_manutencao, dataRetorno: r.data_retorno,
        enviadoPara: JSON.parse(r.enviado_para||"[]"), observacoes: r.observacoes||"",
      })));
    }).catch(() => {});
  }, [dbStatus]);

  const filtered = items.filter(i => {
    const ms = i.status !== "retornou";
    const ss = filterStatus==="todos" || i.status===filterStatus;
    const qs = !search || i.nome.toLowerCase().includes(search.toLowerCase());
    return ms && ss && qs;
  });

  const active = items.filter(i=>i.status!=="retornou");
  const byStatus = Object.keys(STATUS_MANUT).reduce((acc,k)=>({...acc,[k]:active.filter(i=>i.status===k).length}),{});

  function updateItem(id, updates) {
    setItems(prev=>prev.map(i=>i.id===id?{...i,...updates}:i));
    if(selected?.id===id) setSelected(s=>({...s,...updates}));
    if(dbStatus==="ok" && typeof id === "number") {
      const dbUpdates = {};
      if(updates.status!==undefined) dbUpdates.status=updates.status;
      if(updates.responsavel!==undefined) dbUpdates.responsavel=updates.responsavel;
      if(updates.orcamentoLink!==undefined) dbUpdates.orcamento_link=updates.orcamentoLink;
      if(updates.orcamentoValor!==undefined) dbUpdates.orcamento_valor=updates.orcamentoValor;
      if(updates.aprovacao!==undefined) dbUpdates.aprovacao=updates.aprovacao;
      if(updates.observacoes!==undefined) dbUpdates.observacoes=updates.observacoes;
      if(updates.dataAprovacao!==undefined) dbUpdates.data_aprovacao=updates.dataAprovacao;
      if(updates.dataEnvio!==undefined) dbUpdates.data_envio=updates.dataEnvio;
      if(updates.dataChegada!==undefined) dbUpdates.data_chegada=updates.dataChegada;
      if(updates.dataManutencao!==undefined) dbUpdates.data_manutencao=updates.dataManutencao;
      if(updates.dataRetorno!==undefined) dbUpdates.data_retorno=updates.dataRetorno;
      if(updates.enviadoPara!==undefined) dbUpdates.enviado_para=JSON.stringify(updates.enviadoPara);
      if(Object.keys(dbUpdates).length) { dbUpdates.updated_at=new Date().toISOString(); sb.patch("manutencao",id,dbUpdates).catch(()=>{}); }
    }
  }

  function addItem() {
    if(!newItem.nome.trim()) return;
    const entry = {...newItem,id:Date.now(),orcamentoLink:"",orcamentoValor:"",aprovacao:"pendente",dataEntrada:TODAY.toISOString().slice(0,10),dataAprovacao:null,dataEnvio:null,dataChegada:null,dataManutencao:null,dataRetorno:null,enviadoPara:[],observacoes:""};
    setItems(prev=>[...prev,entry]);
    if(dbStatus==="ok") sb.post("manutencao",{nome:entry.nome,motivo:entry.motivo,status:entry.status,responsavel:entry.responsavel,aprovacao:"pendente",data_entrada:entry.dataEntrada,enviado_para:"[]"}).then(rows=>{if(rows&&rows[0]) setItems(prev=>prev.map(i=>i.id===entry.id?{...i,id:rows[0].id}:i));}).catch(()=>{});
    setNewItem({nome:"",motivo:"",status:"aguardando_orcamento",responsavel:"Will"});
    setShowForm(false);
  }

  const FLOW_STEPS = [
    {key:"aguardando_orcamento",label:"Orçamento"},
    {key:"orcamento_enviado",label:"Enviado"},
    {key:"aguardando_aprovacao",label:"Aprovação"},
    {key:"aprovado",label:"Aprovado"},
    {key:"aguardando_peca",label:"Aguard. peça"},
    {key:"em_manutencao",label:"Em manutenção"},
    {key:"pronto",label:"Pronto"},
    {key:"retornou",label:"Retornou"},
  ];

  const stepIdx = (s) => FLOW_STEPS.findIndex(f=>f.key===s);

  return (
    <div style={{padding:"14px 14px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🔧 Manutenção — JP (João Pessoa)</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{active.length} itens ativos · {items.filter(i=>i.status==="retornou").length} retornaram ao estoque</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.laranja)}>+ Novo item</button>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {Object.entries(STATUS_MANUT).filter(([k])=>byStatus[k]>0).map(([k,v])=>(
          <div key={k} style={{background:C.card,border:`1px solid ${v.color}33`,borderRadius:8,padding:"6px 12px",flexShrink:0}}>
            <div style={{fontSize:18,fontWeight:800,color:v.color}}>{byStatus[k]}</div>
            <div style={{fontSize:9,color:C.textMuted,whiteSpace:"nowrap"}}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* New item form */}
      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.laranja}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar item em manutenção</div>
          <input value={newItem.nome} onChange={e=>setNewItem({...newItem,nome:e.target.value})} placeholder="Nome do brinquedo" style={{...inputSt,marginBottom:8}} />
          <textarea value={newItem.motivo} onChange={e=>setNewItem({...newItem,motivo:e.target.value})} placeholder="Motivo / problema identificado" style={{...inputSt,height:60,resize:"vertical",marginBottom:8}} />
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <select value={newItem.status} onChange={e=>setNewItem({...newItem,status:e.target.value})} style={inputSt}>
              {Object.entries(STATUS_MANUT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={newItem.responsavel} onChange={e=>setNewItem({...newItem,responsavel:e.target.value})} style={inputSt}>
              <option>Will</option><option>Ivanise</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addItem} style={btnSt(C.laranja)}>Registrar</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar item..." style={{...inputSt,width:200}} />
        {["todos",...Object.keys(STATUS_MANUT)].map(k=>(
          <button key={k} onClick={()=>setFilterStatus(k)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===k?C.laranja:C.cardBorder}`,
            background:filterStatus===k?`${C.laranja}22`:"transparent",
            color:filterStatus===k?C.laranja:C.textMuted,
          }}>{k==="todos"?"Todos":STATUS_MANUT[k]?.label}</button>
        ))}
      </div>

      {/* Items list */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        {filtered.map((item,i)=>{
          const sc = STATUS_MANUT[item.status];
          const si = stepIdx(item.status);
          return (
            <div key={item.id} style={{
              borderBottom:i<filtered.length-1?`1px solid ${C.cardBorder}`:"none",
              padding:"12px 16px", cursor:"pointer",
              background:selected?.id===item.id?C.cardHover:"transparent",
            }} onClick={()=>setSelected(selected?.id===item.id?null:item)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.textPrimary,marginBottom:4}}>{item.nome}</div>
                  {/* Flow bar */}
                  <div style={{display:"flex",gap:2,marginBottom:4}}>
                    {FLOW_STEPS.map((step,idx)=>(
                      <div key={step.key} style={{
                        height:3, flex:1, borderRadius:2,
                        background: idx<=si ? sc.color : C.cardBorder,
                      }} />
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:700,color:sc.color}}>{sc.label}</span>
                    {item.motivo&&<span style={{fontSize:10,color:C.textMuted}}>· {item.motivo.slice(0,40)}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,marginLeft:12}}>
                  <select value={item.status} onChange={e=>{e.stopPropagation();updateItem(item.id,{status:e.target.value})}}
                    onClick={e=>e.stopPropagation()}
                    style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                    {Object.entries(STATUS_MANUT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Expanded edit */}
              {selected?.id===item.id&&(
                <div style={{marginTop:12,padding:12,background:C.inset,borderRadius:8}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <label style={labelSt}>Orçamento (R$)</label>
                      <input value={item.orcamentoValor} onChange={e=>updateItem(item.id,{orcamentoValor:e.target.value})} placeholder="Valor do orçamento" style={inputSt} />
                    </div>
                    <div>
                      <label style={labelSt}>Link do orçamento (Drive)</label>
                      <input value={item.orcamentoLink} onChange={e=>updateItem(item.id,{orcamentoLink:e.target.value})} placeholder="https://drive.google.com/..." style={inputSt} />
                    </div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <label style={labelSt}>Enviado para aprovação</label>
                    <div style={{display:"flex",gap:8}}>
                      {["Júnior","Mariana"].map(p=>(
                        <label key={p} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:12,color:C.textMuted}}>
                          <input type="checkbox" checked={(item.enviadoPara||[]).includes(p)}
                            onChange={e=>{
                              const arr = item.enviadoPara||[];
                              updateItem(item.id,{enviadoPara:e.target.checked?[...arr,p]:arr.filter(x=>x!==p)});
                            }} />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                    {[["dataEntrada","Entrada manut."],["dataEnvio","Envio peça"],["dataChegada","Chegada peça"],["dataManutencao","Início manut."],["dataRetorno","Retorno estoque"]].slice(0,3).map(([k,l])=>(
                      <div key={k}>
                        <label style={labelSt}>{l}</label>
                        <input type="date" value={item[k]||""} onChange={e=>updateItem(item.id,{[k]:e.target.value})} style={inputSt} />
                      </div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    {[["dataManutencao","Início manut."],["dataRetorno","Retorno estoque"]].map(([k,l])=>(
                      <div key={k}>
                        <label style={labelSt}>{l}</label>
                        <input type="date" value={item[k]||""} onChange={e=>updateItem(item.id,{[k]:e.target.value})} style={inputSt} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={labelSt}>Observações</label>
                    <textarea value={item.observacoes} onChange={e=>updateItem(item.id,{observacoes:e.target.value})}
                      placeholder="Notas adicionais..." style={{...inputSt,height:55,resize:"vertical"}} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:C.textMuted}}>Nenhum item encontrado</div>
        )}
      </div>
    </div>
  );
}

// ─── 3D PRINT MODULE ─────────────────────────────────────────
function Print3DModule({ dbStatus }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    unidade:"",descricao:"",temProjeto:false,
    statusProjeto:"aguardando_junior",prazoJunior:"",
    statusImpressao:"na_fila",dataImpressao:"",
    dataEnvio:"",rastreio:"",dataEntrega:"",responsavel:"Will",observacoes:""
  });

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("print3d", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) setItems(rows.map(r => ({
        id: r.id, unidade: r.unidade, descricao: r.descricao,
        temProjeto: r.tem_projeto, statusProjeto: r.status_projeto,
        prazoJunior: r.prazo_junior||"", statusImpressao: r.status_impressao,
        dataImpressao: r.data_impressao||"", dataEnvio: r.data_envio||"",
        rastreio: r.rastreio||"", dataEntrega: r.data_entrega||"",
        responsavel: r.responsavel, observacoes: r.observacoes||"",
        dataSolicitacao: r.data_solicitacao,
      })));
    }).catch(() => {});
  }, [dbStatus]);

  const STATUS_3D_PROJETO = {aguardando_junior:"Aguardando Júnior",projeto_em_andamento:"Projeto em andamento",projeto_pronto:"Projeto pronto"};
  const STATUS_3D_PRINT = {na_fila:"Na fila",imprimindo:"Imprimindo",pronto_para_envio:"Pronto p/ envio",enviado:"Enviado",entregue:"Entregue"};
  const statusColor = {aguardando_junior:C.red,projeto_em_andamento:C.amarelo,projeto_pronto:C.verde,na_fila:C.textMuted,imprimindo:C.laranja,pronto_para_envio:C.amarelo,enviado:C.azul,entregue:C.verde};

  function addItem() {
    if(!newItem.descricao.trim()) return;
    const entry = {...newItem,id:Date.now(),dataSolicitacao:TODAY.toISOString().slice(0,10)};
    setItems(prev=>[...prev,entry]);
    if(dbStatus==="ok") sb.post("print3d",{unidade:entry.unidade,descricao:entry.descricao,tem_projeto:entry.temProjeto,status_projeto:entry.statusProjeto,status_impressao:entry.statusImpressao,responsavel:entry.responsavel,data_solicitacao:entry.dataSolicitacao}).then(rows=>{if(rows&&rows[0]) setItems(prev=>prev.map(i=>i.id===entry.id?{...i,id:rows[0].id}:i));}).catch(()=>{});
    setNewItem({unidade:"",descricao:"",temProjeto:false,statusProjeto:"aguardando_junior",prazoJunior:"",statusImpressao:"na_fila",dataImpressao:"",dataEnvio:"",rastreio:"",dataEntrega:"",responsavel:"Will",observacoes:""});
    setShowForm(false);
  }

  function updateItem(id,updates) {
    setItems(prev=>prev.map(i=>i.id===id?{...i,...updates}:i));
    if(dbStatus==="ok" && typeof id==="number") {
      const m={};
      if(updates.statusProjeto!==undefined) m.status_projeto=updates.statusProjeto;
      if(updates.statusImpressao!==undefined) m.status_impressao=updates.statusImpressao;
      if(updates.responsavel!==undefined) m.responsavel=updates.responsavel;
      if(updates.prazoJunior!==undefined) m.prazo_junior=updates.prazoJunior||null;
      if(updates.dataImpressao!==undefined) m.data_impressao=updates.dataImpressao||null;
      if(updates.dataEnvio!==undefined) m.data_envio=updates.dataEnvio||null;
      if(updates.rastreio!==undefined) m.rastreio=updates.rastreio;
      if(updates.dataEntrega!==undefined) m.data_entrega=updates.dataEntrega||null;
      if(updates.observacoes!==undefined) m.observacoes=updates.observacoes;
      if(Object.keys(m).length){m.updated_at=new Date().toISOString(); sb.patch("print3d",id,m).catch(()=>{});}
    }
  }

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🖨️ Impressão 3D</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{items.filter(i=>i.statusImpressao!=="entregue").length} pedidos ativos · {items.filter(i=>i.statusImpressao==="entregue").length} entregues</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.azul)}>+ Novo pedido</button>
      </div>

      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.azul}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Novo pedido 3D</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <label style={labelSt}>Unidade solicitante</label>
              <input value={newItem.unidade} onChange={e=>setNewItem({...newItem,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Responsável</label>
              <select value={newItem.responsavel} onChange={e=>setNewItem({...newItem,responsavel:e.target.value})} style={inputSt}>
                <option>Will</option><option>Ivanise</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <label style={labelSt}>Descrição da peça</label>
            <textarea value={newItem.descricao} onChange={e=>setNewItem({...newItem,descricao:e.target.value})} placeholder="Descrição detalhada da peça necessária" style={{...inputSt,height:55,resize:"vertical"}} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:C.textPrimary}}>
              <input type="checkbox" checked={newItem.temProjeto} onChange={e=>setNewItem({...newItem,temProjeto:e.target.checked})} />
              Já existe projeto 3D
            </label>
          </div>
          {!newItem.temProjeto&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <label style={labelSt}>Status projeto (Júnior)</label>
                <select value={newItem.statusProjeto} onChange={e=>setNewItem({...newItem,statusProjeto:e.target.value})} style={inputSt}>
                  {Object.entries(STATUS_3D_PROJETO).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Prazo para Júnior</label>
                <input type="date" value={newItem.prazoJunior} onChange={e=>setNewItem({...newItem,prazoJunior:e.target.value})} style={inputSt} />
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button onClick={addItem} style={btnSt(C.azul)}>Criar pedido</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {items.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:36,marginBottom:10}}>🖨️</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Nenhum pedido 3D ainda</div>
          <div style={{fontSize:12,marginTop:4}}>Clique em "+ Novo pedido" para registrar</div>
        </div>
      ):(
        <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
          {items.map((item,i)=>{
            const projReady = item.temProjeto || item.statusProjeto==="projeto_pronto";
            const printSc = STATUS_3D_PRINT[item.statusImpressao];
            const projSc = item.temProjeto ? null : STATUS_3D_PROJETO[item.statusProjeto];
            return (
              <div key={item.id} style={{borderBottom:i<items.length-1?`1px solid ${C.cardBorder}`:"none",padding:"12px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{item.descricao}</div>
                    <div style={{fontSize:11,color:C.textMuted,marginTop:1}}>{item.unidade} · Solicitado {fmtDate(item.dataSolicitacao)}</div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    {!item.temProjeto&&(
                      <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${statusColor[item.statusProjeto]}22`,color:statusColor[item.statusProjeto]}}>
                        {projSc}
                      </span>
                    )}
                    <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:`${statusColor[item.statusImpressao]}22`,color:statusColor[item.statusImpressao]}}>
                      {printSc}
                    </span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {!item.temProjeto&&!projReady&&(
                    <select value={item.statusProjeto} onChange={e=>updateItem(item.id,{statusProjeto:e.target.value})}
                      style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:statusColor[item.statusProjeto],fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                      {Object.entries(STATUS_3D_PROJETO).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  )}
                  <select value={item.statusImpressao} onChange={e=>updateItem(item.id,{statusImpressao:e.target.value})}
                    style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:statusColor[item.statusImpressao],fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                    {Object.entries(STATUS_3D_PRINT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  {item.statusImpressao==="enviado"&&(
                    <input value={item.rastreio} onChange={e=>updateItem(item.id,{rastreio:e.target.value})}
                      placeholder="Código rastreio" style={{...inputSt,width:150,fontSize:11,padding:"3px 8px"}} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DIÁRIO DE BORDO ─────────────────────────────────────────
function DiarioView({ units, dbStatus }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ data:TODAY.toISOString().slice(0,10), canal:"Grupo WhatsApp", assunto:"", detalhe:"", responsavel:"Ivanise", unidade:"", prioridade:"Média" });

  // Load from Supabase
  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("diario", "?select=*&order=data.desc").then(rows => {
      if (rows?.length) setEntries(rows.map(r => ({
        id: r.id, data: r.data, canal: r.canal, unidade: r.unidade,
        assunto: r.assunto, detalhe: r.detalhe, responsavel: r.responsavel,
        prioridade: r.prioridade, status: r.status,
      })));
    }).catch(() => {});
  }, [dbStatus]);

  async function addEntry() {
    if(!form.assunto.trim()) return;
    const newEntry = {...form, id: crypto.randomUUID(), status:"pendente", criadoEm: new Date().toISOString()};
    setEntries(prev=>[newEntry,...prev]);
    setForm({...form, assunto:"", detalhe:"", unidade:""});
    if (dbStatus === "ok") {
      try {
        await sb.post("diario", {
          id: newEntry.id, data: newEntry.data, canal: newEntry.canal,
          unidade: newEntry.unidade, assunto: newEntry.assunto,
          detalhe: newEntry.detalhe, responsavel: newEntry.responsavel,
          prioridade: newEntry.prioridade, status: "pendente",
        });
      } catch(e) { console.warn("Diário save error:", e.message); }
    }
  }

  async function resolveEntry(id) {
    setEntries(prev=>prev.map(x=>x.id===id?{...x,status:"resolvido"}:x));
    if (dbStatus === "ok") {
      try { await sb.patch("diario", id, {status:"resolvido",updated_at:new Date().toISOString()}); }
      catch(e) { console.warn(e.message); }
    }
  }

  const pendentes = entries.filter(e=>e.status==="pendente");
  const resolvidos = entries.filter(e=>e.status==="resolvido");

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>📓 Diário de Bordo</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Pontos de grupos e conversas que viraram pendência</div>
      </div>

      {/* Form */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:12}}>Registrar ponto</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div>
            <label style={labelSt}>Data</label>
            <input type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Canal / origem</label>
            <select value={form.canal} onChange={e=>setForm({...form,canal:e.target.value})} style={inputSt}>
              {["Grupo WhatsApp","DM WhatsApp","Grupo Telegram","Ligação","Email","Reunião informal","Outro"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Unidade (se específica)</label>
            <input list="units-list" value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            <datalist id="units-list">{units.map(u=><option key={u.id} value={u.name}/>)}</datalist>
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <label style={labelSt}>Assunto / pendência</label>
          <input value={form.assunto} onChange={e=>setForm({...form,assunto:e.target.value})} placeholder="O que foi levantado?" style={inputSt} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={labelSt}>Detalhes (opcional)</label>
          <textarea value={form.detalhe} onChange={e=>setForm({...form,detalhe:e.target.value})} placeholder="Mais contexto..." style={{...inputSt,height:55,resize:"vertical"}} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <label style={labelSt}>Responsável</label>
            <select value={form.responsavel} onChange={e=>setForm({...form,responsavel:e.target.value})} style={inputSt}>
              <option>Ivanise</option><option>Will</option><option>Franqueado</option><option>Júnior</option><option>Mariana</option><option>Outro</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Prioridade</label>
            <select value={form.prioridade} onChange={e=>setForm({...form,prioridade:e.target.value})} style={inputSt}>
              <option>Alta</option><option>Média</option><option>Baixa</option>
            </select>
          </div>
        </div>
        <button onClick={addEntry} style={btnSt(C.laranja)}>Registrar</button>
      </div>

      {/* Pending */}
      {pendentes.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Pendentes ({pendentes.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
            {pendentes.map((e,i)=>{
              const prioColor={Alta:C.red,Média:C.amarelo,Baixa:C.textMuted};
              return(
                <div key={e.id} style={{padding:"10px 14px",borderBottom:i<pendentes.length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"flex-start",gap:12}}>
                  <button onClick={()=>resolveEntry(e.id)}
                    style={{width:20,height:20,borderRadius:4,border:`2px solid ${C.cardBorder}`,background:"transparent",cursor:"pointer",flexShrink:0,marginTop:2}} />
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{e.assunto}</div>
                    {e.detalhe&&<div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{e.detalhe}</div>}
                    <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:prioColor[e.prioridade]}}>● {e.prioridade}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{e.canal}</span>
                      {e.unidade&&<span style={{fontSize:10,color:C.azul}}>{e.unidade}</span>}
                      <span style={{fontSize:10,color:C.textMuted}}>→ {e.responsavel}</span>
                      <span style={{fontSize:10,color:C.textMuted}}>{fmtDate(e.data)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resolvidos.length>0&&(
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Resolvidos ({resolvidos.length})</div>
          <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden",opacity:0.6}}>
            {resolvidos.slice(0,5).map((e,i)=>(
              <div key={e.id} style={{padding:"8px 14px",borderBottom:i<resolvidos.slice(0,5).length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14,color:C.verde}}>✓</span>
                <div style={{fontSize:12,color:C.textMuted,textDecoration:"line-through"}}>{e.assunto}</div>
                <span style={{fontSize:10,color:C.textMuted,marginLeft:"auto"}}>{fmtDate(e.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length===0&&(
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:36,marginBottom:10}}>📓</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Diário vazio</div>
          <div style={{fontSize:12,marginTop:4}}>Use este espaço para registrar pontos dos grupos que precisam de atenção</div>
        </div>
      )}
    </div>
  );
}

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
function DashboardView({ units, onSelectUnit }) {
  const [viewMode, setViewMode] = useState("diretoria"); // diretoria | supervisao | rede
  const [showPreMeeting, setShowPreMeeting] = useState(null);
  const [preMeetingData, setPreMeetingData] = useState({});

  // ── Supervisão metrics ──────────────────────────────────────
  const allTasks = units.flatMap(u=>(u.tasks||[]).map(t=>({...t,unitName:u.name,group:u.group})));
  const openTasks = allTasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
  const inProgressTasks = allTasks.filter(t=>t.status==="em_andamento");
  const doneTasks = allTasks.filter(t=>t.status==="concluido");
  const overdueTasks = openTasks.filter(t=>t.meetingData&&daysSince(t.meetingData)>14);
  const tasksByResp = openTasks.reduce((acc,t)=>({...acc,[t.responsavel]:(acc[t.responsavel]||0)+1}),{});
  const inProgressByResp = inProgressTasks.reduce((acc,t)=>({...acc,[t.responsavel]:(acc[t.responsavel]||0)+1}),{});

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

// ─── CAMPAIGN ADHERENCE COMPONENT ────────────────────────────
function CampanhasView({ units, onUpdateUnit }) {
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
    let aderiu = current.aderiu;
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
                const cfg=GROUP_CFG[group];
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


// ─── ETAPA 1 CHECKLIST ───────────────────────────────────────
const ETAPA1_ITEMS = [
  // DIVERSOS
  { id:"e1_01", grupo:"Diversos", titulo:"Criar e-mail da unidade no Gmail", desc:"Padrão: ig@gmail.com (ex.: clubkidsjoaopessoa@gmail.com)", resp:"Franqueado" },
  { id:"e1_02", grupo:"Diversos", titulo:"Abrir MEI", desc:"CNAE 7721-7/00 + CNAE 4763-6/01. Atenção: não pagar boleto por e-mail após abertura.", resp:"Franqueado" },
  { id:"e1_03", grupo:"Diversos", titulo:"Solicitar Inscrição Estadual", desc:"CNAE 4763-6/01. Após receber, preencher planilha DADOS DA UNIDADE e enviar para a franqueadora.", resp:"Franqueado" },
  { id:"e1_04", grupo:"Diversos", titulo:"Compra imediata de chip de celular", desc:"Para personalização prévia de cartão de visita e panfleto.", resp:"Franqueado" },
  { id:"e1_05", grupo:"Diversos", titulo:"Celular para uso exclusivo do o clubkids", desc:"iPhone a partir do 11 ou Samsung a partir do S11. Se já possui, comprar chip virtual.", resp:"Franqueado" },
  { id:"e1_06", grupo:"Diversos", titulo:"Pesquisar parcerias e enviar links para validação", desc:"Influencers gestantes/filhos 0-4a, fotógrafo newborn, pediatras, doulas, maternidades, nutricionistas, escolas, buffets infantis, etc.", resp:"Franqueado", apoio:"Ivanise" },
  { id:"e1_07", grupo:"Diversos", titulo:"Explorar APENAS a pasta 1 ETAPA – Inauguração no Google Drive", desc:"Não acessar outras pastas ainda.", resp:"Franqueado" },
  { id:"e1_08", grupo:"Diversos", titulo:"Confecção de camisas padronizadas (serigrafia)", desc:"3 modelos disponíveis na pasta Drive: polo bordado, polo DTF, dryfit sublimação.", resp:"Franqueado" },
  { id:"e1_09", grupo:"Diversos", titulo:"Material gráfico — ATUALCARD + gráfica local", desc:"TAG 1ª locação (500), panfletos (2.500), cartão de visita (1.000 com verniz 30%), adesivo higienizado (500), adesivo carro (opc.), FlyBanner (opc.), livrinho pintura (opc.).", resp:"Franqueado" },
  { id:"e1_10", grupo:"Diversos", titulo:"Comprar material para embalagem dos brinquedos", desc:"Sacos plásticos (gramatura 12, cristal, 200 un, 0,80x1,10m e 0,80x0,60m), rolo filme PVC (2 un), rolo saco pequeno, durex largo, enforca gato 20cm.", resp:"Franqueado" },
  { id:"e1_11", grupo:"Diversos", titulo:"Comprar material para higienização", desc:"Sabão neutro, detergente neutro, álcool 70% (galão 5L), vaselina Doppler, buchas, pano perfex, chave de fenda, Vanish, limpa contato, gracha branca, silicone líquido.", resp:"Franqueado" },
  { id:"e1_12", grupo:"Diversos", titulo:"Compra de Bags para peças avulsas/carregadores (opcional)", desc:"Pastinha P 15x17, bolsinha c/ proteção 17x21x15, maletas transparentes P/M/G.", resp:"Franqueado", opcional:true },
  { id:"e1_13", grupo:"Diversos", titulo:"Compra de Etiquetadora", desc:"Para identificar controles de elétricos e fontes. Deve conter: PRODUTO – VOLTAGEM – AMPERAGEM.", resp:"Franqueado" },
  { id:"e1_14", grupo:"Diversos", titulo:"Compra de brinquedos (1ªs compras à vista/PIX no representante)", desc:"Franqueadora faz o 1º pedido. Franqueado paga direto ao fornecedor. Conferir endereço nos romaneios. Etiquetar carregadores.", resp:"Mariana", apoio:"Franqueado" },
  { id:"e1_15", grupo:"Diversos", titulo:"Preenchimento e envio da planilha de estoque no grupo WPP", desc:"Salvar planilha do Drive, preencher e enviar sempre que houver compra ou chegada. Colorir itens que chegarem para planejar entrega aos parceiros.", resp:"Franqueado" },
  { id:"e1_16", grupo:"Diversos", titulo:"Aulas na universidade corporativa", desc:"a) Processo para abertura de Franquia (30min) · b) Sistema de gerenciamento — Módulo 1 (2min) + Módulo 2 (7min).", resp:"Franqueado" },
  { id:"e1_17", grupo:"Diversos", titulo:"Cadastramento de brinquedos no sistema", desc:"Categorias 0-11 em sequência. Planos por tipo de produto (Doppler 30/60/90d, carros 7/15/30d, etc.).", resp:"Franqueado", apoio:"Jeniffer" },
  { id:"e1_18", grupo:"Diversos", titulo:"Colocar brinquedos em destaques no sistema", desc:"", resp:"Franqueado" },
  // INSTAGRAM
  { id:"e1_19", grupo:"Instagram", titulo:"Alterar senha do Instagram + autenticação de dois fatores", desc:"", resp:"Franqueado", apoio:"Jeniffer" },
  { id:"e1_20", grupo:"Instagram", titulo:"Publicar os 21 posts padronizados do feed (Trello)", desc:"Apenas salvar jpg, copiar legenda, editar telefone. NÃO alterar legendas. Reels podem ser feitos mas ocultados do feed até inauguração.", resp:"Franqueado" },
  { id:"e1_21", grupo:"Instagram", titulo:"Stories e Reels livres de qualidade", desc:"Apresentação, como funciona, sustentabilidade, enquetes, spoilers caixas, higienização, unboxing, entrega. Marcar @clubkidsoficial e @franquiasclubkids discretamente.", resp:"Franqueado" },
  { id:"e1_22", grupo:"Instagram", titulo:"Prospecção de clientes no Instagram", desc:"Seguir perfis de parceiros e público infantil (mulheres jovens com filhos). Máximo 20 por hora.", resp:"Franqueado" },
  { id:"e1_23", grupo:"Instagram", titulo:"Pedir ajuda a amigas mães para divulgar o Instagram", desc:"", resp:"Franqueado" },
  { id:"e1_24", grupo:"Instagram", titulo:"Navegar pelo Instagram de outras unidades como referência de conteúdo", desc:"", resp:"Franqueado" },
];

const ETAPAS_GESTACAO = [
  { id:"e1", numero:1, nome:"Etapa 1 — Diversos + Instagram", cor:"#f19134", items: ETAPA1_ITEMS.length, resp:"Franqueado + Jeniffer + Mariana" },
  { id:"e2", numero:2, nome:"Etapa 2 — Parcerias e chegada dos brinquedos", cor:"#6e81bf", items: 0, resp:"Franqueado + Ivanise", pendente:true },
  { id:"e3", numero:3, nome:"Etapa 3 — Estratégia de lançamento", cor:"#6ece87", items: 0, resp:"Franqueado + Ivanise", pendente:true },
  { id:"e4", numero:4, nome:"Etapa 4 — Reunião pré-inauguração", cor:"#a78bfa", items: 0, resp:"Ivanise", pendente:true },
];

// Pre-inauguration meetings from Drive
const PRE_INAUG_MEETINGS = [
  { unidade:"PR - TOLEDO", data:"2026-01-13", docId:"1N4QhnLF3mN_7ByXLi2yQ6xBCYL31jpKoIKmSxPJFcsI", franqueado:"Thiago Dalmaso + Helen + Regiane (Ituiutaba) + Fernanda (Barreiras)", extra:["BA - BARREIRAS","MG - ITUIUTABA"] },
  { unidade:"AL - ARAPIRACA", data:"2026-02-09", docId:"1eYE6aRV_d2QQ0dnQP5H3ziFBwYo2G9Jfuo8_c252WT8", franqueado:"ClubKids Arapiraca", gravacao:"https://drive.google.com/file/d/1abnnotL2cE2HzqqQl87yscKLm27rw89L/view" },
  { unidade:"MG - VIÇOSA", data:"2025-06-19", docId:"1GLYXPeoOkJzjSXucGrUKuCQgRp-XFNM-yDiZMlx5t1Y", franqueado:"Milla Valhe" },
  { unidade:"SP - INDAIATUBA", data:"2025-08-07", docId:"1tEVCH_lTs4Vw5u6-aT0WBUT-JTq8S5tC-VPi31mRTc0", franqueado:"Carol Biagioni", gravacao:"https://drive.google.com/file/d/1bCqpcrRCkOu5OlFFC1T2mB6NaCBnLlm2/view" },
  { unidade:"SP - PINDAMONHANGABA", data:"2025-07-10", docId:"1EW4oYBqGFPZ8o5ZlAuVaZnIMfP9FlzGIQ8n2samgaVI", franqueado:"Cristiane Carvalho + Rafael Brugnara", extra:["SP - PAULÍNIA"] },
];

// JP Staff
const JP_STAFF = [
  { id:"clenia", nome:"Clênia", funcao:"Atendimento", cor:"#f19134" },
  { id:"samara", nome:"Samara", funcao:"Pós-venda", cor:"#6e81bf" },
  { id:"fabio", nome:"Fábio", funcao:"Higienização", cor:"#6ece87" },
  { id:"renan", nome:"Renan", funcao:"Entregas e Manutenção", cor:"#a78bfa" },
];

// ─── INAUGURATION MODULE ─────────────────────────────────────
function InaugurationModule({ units, dbStatus }) {
  const [activeUnit, setActiveUnit] = useState(null);
  const [unitsData, setUnitsData] = useState({});
  const [filterStatus, setFilterStatus] = useState("em_gestacao");
  const [newUnit, setNewUnit] = useState({ nome:"", dataContrato:"", dataGrupoWPP:"" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [inauguracoes, setInauguracoes] = useState(() => {
    // Pre-populate with units that are still in bercario or recently inaugurated
    const bercarios = units.filter(u => u.group === "BERÇÁRIO");
    return bercarios.map(u => ({
      id: u.name,
      nome: u.name,
      dataContrato: u.inaug,
      dataGrupoWPP: u.inaug,
      dataInauguracao: u.inaug,
      etapaAtual: "inaugurada",
      etapaChecks: {},
      preInaugMeeting: PRE_INAUG_MEETINGS.find(m => m.unidade === u.name || (m.extra||[]).includes(u.name)) || null,
      observacoes: "",
    }));
  });

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("inauguracao", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) {
        setInauguracoes(prev => {
          const dbById = {};
          rows.forEach(r => { dbById[r.id] = r; });
          const updated = prev.map(u => {
            const r = dbById[u.id];
            if (!r) return u;
            return { ...u, dataContrato: r.data_contrato||u.dataContrato, dataGrupoWPP: r.data_grupo_wpp||u.dataGrupoWPP, dataInauguracao: r.data_inauguracao||u.dataInauguracao, etapaAtual: r.etapa_atual||u.etapaAtual, etapaChecks: r.etapa_checks||u.etapaChecks, observacoes: r.observacoes||u.observacoes };
          });
          const existingIds = new Set(prev.map(u=>u.id));
          rows.forEach(r => { if(!existingIds.has(r.id)) updated.push({ id:r.id, nome:r.nome, dataContrato:r.data_contrato, dataGrupoWPP:r.data_grupo_wpp, dataInauguracao:r.data_inauguracao, etapaAtual:r.etapa_atual||"em_gestacao", etapaChecks:r.etapa_checks||{}, observacoes:r.observacoes||"" }); });
          return updated;
        });
      }
    }).catch(() => {});
  }, [dbStatus]);

  const STATUS_OPTIONS = [
    { id:"em_gestacao", label:"🐣 Em gestação", cor:"#a78bfa" },
    { id:"inaugurada", label:"✅ Inaugurada", cor:"#6ece87" },
    { id:"todas", label:"Todas", cor:"#6b7280" },
  ];

  const filtered = inauguracoes.filter(u =>
    filterStatus === "todas" || u.etapaAtual === filterStatus
  );

  function addUnit() {
    if (!newUnit.nome.trim()) return;
    const newId = `new_${Date.now()}`;
    const entry = { id: newId, nome: newUnit.nome, dataContrato: newUnit.dataContrato, dataGrupoWPP: newUnit.dataGrupoWPP, dataInauguracao: null, etapaAtual: "em_gestacao", etapaChecks: {}, preInaugMeeting: null, observacoes: "" };
    setInauguracoes(prev => [...prev, entry]);
    if (dbStatus==="ok") sb.upsert("inauguracao", { id: newId, nome: entry.nome, data_contrato: entry.dataContrato||null, data_grupo_wpp: entry.dataGrupoWPP||null, etapa_atual: "em_gestacao", etapa_checks: {} }, "id").catch(()=>{});
    setNewUnit({ nome:"", dataContrato:"", dataGrupoWPP:"" });
    setShowAddForm(false);
  }

  function updateUnit(id, updates) {
    setInauguracoes(prev => prev.map(u => u.id === id ? {...u,...updates} : u));
    if (activeUnit?.id === id) setActiveUnit(u => ({...u,...updates}));
    if (dbStatus==="ok") {
      const m={};
      if(updates.etapaAtual!==undefined) m.etapa_atual=updates.etapaAtual;
      if(updates.dataInauguracao!==undefined) m.data_inauguracao=updates.dataInauguracao||null;
      if(updates.observacoes!==undefined) m.observacoes=updates.observacoes;
      if(updates.etapaChecks!==undefined) m.etapa_checks=updates.etapaChecks;
      if(Object.keys(m).length){m.updated_at=new Date().toISOString(); sb.upsert("inauguracao",{id,...m},"id").catch(()=>{});}
    }
  }

  function toggleCheck(unitId, etapaId, itemId, val) {
    setInauguracoes(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      const ec = u.etapaChecks || {};
      const etapaChecks = ec[etapaId] || {};
      const newChecks = { ...etapaChecks, [itemId]: val };
      const newEtapaChecks = { ...ec, [etapaId]: newChecks };
      if (dbStatus==="ok") sb.upsert("inauguracao",{id:unitId,etapa_checks:newEtapaChecks,updated_at:new Date().toISOString()},"id").catch(()=>{});
      // Auto-advance etapa when all items checked
      const etapa = ETAPAS_GESTACAO.find(e => e.id === etapaId);
      const etapaItems = etapa?.id === "e1" ? ETAPA1_ITEMS : [];
      const allDone = etapaItems.length > 0 && etapaItems.every(i => newChecks[i.id]);
      return { ...u, etapaChecks: newEtapaChecks };
    }));
  }

  function getProgress(unit, etapaId) {
    const etapa = ETAPAS_GESTACAO.find(e => e.id === etapaId);
    const items = etapa?.id === "e1" ? ETAPA1_ITEMS : [];
    if (items.length === 0) return { done: 0, total: 0, pct: 0 };
    const checks = unit.etapaChecks?.[etapaId] || {};
    const done = items.filter(i => checks[i.id]).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  }

  const emGestacao = inauguracoes.filter(u => u.etapaAtual === "em_gestacao").length;
  const inauguradas = inauguracoes.filter(u => u.etapaAtual === "inaugurada").length;

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🐣 Inaugurações — Fase de Gestação</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>
            {emGestacao} em gestação · {inauguradas} inauguradas recentemente
          </div>
        </div>
        <button onClick={()=>setShowAddForm(!showAddForm)} style={btnSt(C.bercario)}>+ Nova unidade</button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div style={{background:C.card,border:`1px solid ${C.bercario}44`,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textPrimary,marginBottom:10}}>Registrar nova unidade em gestação</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <label style={labelSt}>Nome da unidade</label>
              <input list="all-units" value={newUnit.nome} onChange={e=>setNewUnit({...newUnit,nome:e.target.value})} placeholder="Ex: SP - CAMPINAS" style={inputSt} />
              <datalist id="all-units">{units.map(u=><option key={u.id} value={u.name}/>)}</datalist>
            </div>
            <div>
              <label style={labelSt}>Data assinatura contrato</label>
              <input type="date" value={newUnit.dataContrato} onChange={e=>setNewUnit({...newUnit,dataContrato:e.target.value})} style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Data criação grupo WPP</label>
              <input type="date" value={newUnit.dataGrupoWPP} onChange={e=>setNewUnit({...newUnit,dataGrupoWPP:e.target.value})} style={inputSt} />
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addUnit} style={btnSt(C.bercario)}>Registrar</button>
            <button onClick={()=>setShowAddForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {STATUS_OPTIONS.map(s=>(
          <button key={s.id} onClick={()=>setFilterStatus(s.id)} style={{
            padding:"4px 12px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterStatus===s.id?s.cor:C.cardBorder}`,
            background:filterStatus===s.id?`${s.cor}22`:"transparent",
            color:filterStatus===s.id?s.cor:C.textMuted,
          }}>{s.label}</button>
        ))}
      </div>

      {/* Units list */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px 20px",color:C.textMuted,background:C.card,borderRadius:12,border:`1px solid ${C.cardBorder}`}}>
          <div style={{fontSize:32,marginBottom:10}}>🐣</div>
          <div style={{fontSize:14,fontWeight:600,color:C.textPrimary}}>Nenhuma unidade nessa fase</div>
          <div style={{fontSize:12,marginTop:4}}>Registre uma nova unidade em gestação acima</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(unit => {
            const e1prog = getProgress(unit, "e1");
            const preInaugMeet = PRE_INAUG_MEETINGS.find(m =>
              m.unidade === unit.nome || (m.extra||[]).includes(unit.nome)
            );
            const isOpen = activeUnit?.id === unit.id;
            const daysInProcess = unit.dataContrato ? Math.floor((TODAY - new Date(unit.dataContrato)) / 86400000) : null;

            return (
              <div key={unit.id} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
                {/* Header row */}
                <div onClick={()=>setActiveUnit(isOpen?null:unit)}
                  style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:700,color:C.textPrimary}}>{unit.nome}</span>
                      <span style={{fontSize:9,padding:"2px 7px",borderRadius:4,
                        background:unit.etapaAtual==="inaugurada"?`${C.verde}22`:`${C.bercario}22`,
                        color:unit.etapaAtual==="inaugurada"?C.verde:C.bercario,
                        border:`1px solid ${unit.etapaAtual==="inaugurada"?C.verde:C.bercario}44`}}>
                        {unit.etapaAtual==="inaugurada"?"✅ Inaugurada":"🐣 Em gestação"}
                      </span>
                      {preInaugMeet && <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${C.azul}22`,color:C.azul}}>Reunião pré-inaug ✓</span>}
                    </div>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {unit.dataContrato&&<span style={{fontSize:10,color:C.textMuted}}>📝 Contrato: {fmtDate(unit.dataContrato)}</span>}
                      {unit.dataGrupoWPP&&<span style={{fontSize:10,color:C.textMuted}}>💬 Grupo WPP: {fmtDate(unit.dataGrupoWPP)}</span>}
                      {daysInProcess!==null&&<span style={{fontSize:10,color:C.textMuted}}>{daysInProcess} dias no processo</span>}
                      {unit.dataInauguracao&&<span style={{fontSize:10,color:C.verde}}>🎉 Inaugurou: {fmtDate(unit.dataInauguracao)}</span>}
                    </div>
                  </div>

                  {/* Etapa 1 progress */}
                  <div style={{width:100,flexShrink:0}}>
                    <div style={{fontSize:9,color:C.textMuted,marginBottom:2}}>Etapa 1: {e1prog.done}/{e1prog.total}</div>
                    <ProgressBar pct={e1prog.pct} color={C.laranja} height={4} />
                  </div>
                  <span style={{fontSize:11,color:C.textMuted}}>{isOpen?"▲":"▼"}</span>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{borderTop:`1px solid ${C.cardBorder}`,padding:"14px 16px"}}>

                    {/* Quick actions */}
                    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                      <div>
                        <label style={labelSt}>Status</label>
                        <select value={unit.etapaAtual} onChange={e=>updateUnit(unit.id,{etapaAtual:e.target.value})} style={inputSt}>
                          <option value="em_gestacao">🐣 Em gestação</option>
                          <option value="inaugurada">✅ Inaugurada</option>
                        </select>
                      </div>
                      {unit.etapaAtual==="inaugurada"&&(
                        <div>
                          <label style={labelSt}>Data de inauguração</label>
                          <input type="date" value={unit.dataInauguracao||""} onChange={e=>updateUnit(unit.id,{dataInauguracao:e.target.value})} style={inputSt} />
                        </div>
                      )}
                    </div>

                    {/* Reunião pré-inauguração */}
                    {preInaugMeet && (
                      <div style={{background:`${C.azul}11`,border:`1px solid ${C.azul}33`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:700,color:C.azul,marginBottom:2}}>📋 Reunião pré-inauguração registrada</div>
                        <div style={{fontSize:11,color:C.textMuted}}>{fmtDate(preInaugMeet.data)} · {preInaugMeet.franqueado}</div>
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <a href={`https://docs.google.com/document/d/${preInaugMeet.docId}/edit`} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:C.azul,textDecoration:"none"}}>🔗 Ver ata</a>
                          {preInaugMeet.gravacao&&<a href={preInaugMeet.gravacao} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:11,color:C.verde,textDecoration:"none"}}>📹 Gravação</a>}
                        </div>
                      </div>
                    )}

                    {/* Etapas */}
                    {ETAPAS_GESTACAO.map(etapa => {
                      const prog = getProgress(unit, etapa.id);
                      const items = etapa.id === "e1" ? ETAPA1_ITEMS : [];
                      const grupos = [...new Set(items.map(i=>i.grupo))];
                      return (
                        <div key={etapa.id} style={{marginBottom:12,border:`1px solid ${etapa.cor}33`,borderRadius:10,overflow:"hidden"}}>
                          <div style={{padding:"8px 12px",background:`${etapa.cor}11`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <span style={{fontSize:12,fontWeight:700,color:etapa.cor}}>{etapa.nome}</span>
                              <span style={{fontSize:10,color:C.textMuted,marginLeft:8}}>→ {etapa.resp}</span>
                              {etapa.pendente&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:3,background:`${C.amarelo}33`,color:C.amareloTxt,marginLeft:6}}>PDF pendente</span>}
                            </div>
                            {prog.total>0&&(
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{fontSize:10,fontWeight:700,color:prog.pct===100?C.verde:etapa.cor}}>{prog.done}/{prog.total}</span>
                                <div style={{width:60}}><ProgressBar pct={prog.pct} color={etapa.cor} height={4}/></div>
                              </div>
                            )}
                          </div>
                          {etapa.pendente ? (
                            <div style={{padding:"8px 12px",fontSize:11,color:C.textMuted}}>⏳ Checklist pendente — PDF das etapas 3 e 4 ainda não recebido.</div>
                          ) : (
                            <div style={{padding:"6px 0"}}>
                              {grupos.map(grupo=>(
                                <div key={grupo}>
                                  <div style={{padding:"4px 12px",fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",background:C.inset}}>{grupo}</div>
                                  {items.filter(i=>i.grupo===grupo).map(item=>{
                                    const checked = unit.etapaChecks?.[etapa.id]?.[item.id] || false;
                                    return (
                                      <label key={item.id} style={{
                                        display:"flex",alignItems:"flex-start",gap:10,padding:"7px 12px",cursor:"pointer",
                                        background:checked?`${etapa.cor}08`:"transparent",
                                        borderBottom:`1px solid ${C.cardBorder}`,
                                      }}>
                                        <input type="checkbox" checked={checked}
                                          onChange={e=>toggleCheck(unit.id,etapa.id,item.id,e.target.checked)}
                                          style={{marginTop:2,flexShrink:0,accentColor:etapa.cor}} />
                                        <div style={{flex:1}}>
                                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                                            <span style={{fontSize:12,fontWeight:600,color:checked?C.textMuted:C.textPrimary,
                                              textDecoration:checked?"line-through":"none"}}>{item.titulo}</span>
                                            {item.opcional&&<span style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:`${C.textMuted}22`,color:C.textMuted}}>opcional</span>}
                                          </div>
                                          {item.desc&&<div style={{fontSize:10,color:C.textMuted,marginTop:1,lineHeight:1.4}}>{item.desc}</div>}
                                          <div style={{display:"flex",gap:8,marginTop:2}}>
                                            <span style={{fontSize:9,color:etapa.cor}}>→ {item.resp}</span>
                                            {item.apoio&&<span style={{fontSize:9,color:C.textMuted}}>apoio: {item.apoio}</span>}
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Observações */}
                    <div>
                      <label style={labelSt}>Observações</label>
                      <textarea value={unit.observacoes||""} onChange={e=>updateUnit(unit.id,{observacoes:e.target.value})}
                        placeholder="Notas sobre o processo de inauguração..." style={{...inputSt,height:55,resize:"vertical"}} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ANIVERSARIANTES/DESTAQUES MODULE ────────────────────────
function AniversariantesModule({ dbStatus }) {
  const [mes, setMes] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  const [demandas, setDemandas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo:"aniversariante", nome:"", unidade:"", artePedida:"", arteLink:"", dataEnvioArte:"", dataPublicacao:"", statusArte:"pendente", observacao:"" });

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("demandas_arte", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) setDemandas(rows.map(r => ({
        id: r.id, tipo: r.tipo, nome: r.nome, unidade: r.unidade,
        artePedida: r.arte_pedida||"", arteLink: r.arte_link||"",
        dataEnvioArte: r.data_envio_arte||"", dataPublicacao: r.data_publicacao||"",
        statusArte: r.status_arte||"pendente", observacao: r.observacao||"",
      })));
    }).catch(() => {});
  }, [dbStatus]);

  const STATUS_ARTE = {
    pendente: { label:"Pendente", color:C.amareloTxt },
    solicitado: { label:"Solicitado para Artur", color:C.azul },
    pronto: { label:"Arte pronta", color:C.verde },
    publicado: { label:"Publicado @franquiasclubkids", color:C.verde },
  };

  const mesDemandas = demandas.filter(d => d.mes === mes);
  const aniversariantes = mesDemandas.filter(d => d.tipo === "aniversariante");
  const destaques = mesDemandas.filter(d => d.tipo === "destaque");

  const mesLabel = new Date(mes+"-15").toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  const hoje = new Date("2026-06-03");
  const quintoUtil = new Date(mes+"-05");

  function addDemanda() {
    if (!form.nome.trim()) return;
    setDemandas(prev=>[...prev,{...form,id:Date.now(),mes,criadoEm:hoje.toISOString().slice(0,10)}]);
    setForm({tipo:"aniversariante",nome:"",unidade:"",artePedida:"",arteLink:"",dataEnvioArte:"",dataPublicacao:"",statusArte:"pendente",observacao:""});
    setShowForm(false);
  }

  function updateDemanda(id,updates) { setDemandas(prev=>prev.map(d=>d.id===id?{...d,...updates}:d)); }

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🎂 Aniversariantes e Destaques</div>
          <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Controle mensal — Will gera até 5º dia útil → Artur cria arte → @franquiasclubkids</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{...inputSt,width:140}} />
          <button onClick={()=>setShowForm(!showForm)} style={btnSt(C.laranja)}>+ Adicionar</button>
        </div>
      </div>

      {/* Status bar */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <span style={{fontSize:11,color:C.textMuted}}>Mês: </span>
          <span style={{fontSize:12,fontWeight:700,color:C.textPrimary,textTransform:"capitalize"}}>{mesLabel}</span>
        </div>
        <div>
          <span style={{fontSize:11,color:C.textMuted}}>Prazo Will: </span>
          <span style={{fontSize:12,fontWeight:700,color:C.amareloTxt}}>até 5º dia útil</span>
        </div>
        <div style={{display:"flex",gap:12}}>
          <span style={{fontSize:11,color:C.textMuted}}>🎂 Aniversariantes: <b style={{color:C.textPrimary}}>{aniversariantes.length}</b></span>
          <span style={{fontSize:11,color:C.textMuted}}>⭐ Destaques: <b style={{color:C.textPrimary}}>{destaques.length}</b></span>
          <span style={{fontSize:11,color:C.verde}}>✅ Publicados: <b>{mesDemandas.filter(d=>d.statusArte==="publicado").length}</b></span>
        </div>
      </div>

      {/* Form */}
      {showForm&&(
        <div style={{background:C.card,border:`1px solid ${C.laranja}44`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
            <div>
              <label style={labelSt}>Tipo</label>
              <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} style={inputSt}>
                <option value="aniversariante">🎂 Aniversariante</option>
                <option value="destaque">⭐ Destaque do mês</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Nome do franqueado</label>
              <input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Unidade</label>
              <input value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})} placeholder="Ex: PR - TOLEDO" style={inputSt} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <label style={labelSt}>Descrição da arte pedida a Artur</label>
              <input value={form.artePedida} onChange={e=>setForm({...form,artePedida:e.target.value})} placeholder="Ex: card aniversário padrão com foto" style={inputSt} />
            </div>
            <div>
              <label style={labelSt}>Status da arte</label>
              <select value={form.statusArte} onChange={e=>setForm({...form,statusArte:e.target.value})} style={inputSt}>
                {Object.entries(STATUS_ARTE).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addDemanda} style={btnSt(C.laranja)}>Adicionar</button>
            <button onClick={()=>setShowForm(false)} style={btnSt("transparent",C.textMuted)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* List by type */}
      {[{tipo:"aniversariante",label:"🎂 Aniversariantes",items:aniversariantes},{tipo:"destaque",label:"⭐ Destaques do mês",items:destaques}].map(section=>(
        <div key={section.tipo} style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
            {section.label} ({section.items.length})
          </div>
          {section.items.length===0?(
            <div style={{padding:"14px",background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,fontSize:12,color:C.textMuted,textAlign:"center"}}>
              Nenhum {section.tipo} registrado para {mesLabel}
            </div>
          ):(
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:10,overflow:"hidden"}}>
              {section.items.map((d,i)=>{
                const sc=STATUS_ARTE[d.statusArte];
                return (
                  <div key={d.id} style={{padding:"10px 14px",borderBottom:i<section.items.length-1?`1px solid ${C.cardBorder}`:"none",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{d.nome}</div>
                      <div style={{fontSize:11,color:C.textMuted}}>{d.unidade}</div>
                      {d.artePedida&&<div style={{fontSize:10,color:C.textMuted,marginTop:2}}>Arte: {d.artePedida}</div>}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                      {d.arteLink&&<a href={d.arteLink} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.azul,textDecoration:"none"}}>🔗 Arte</a>}
                      <select value={d.statusArte} onChange={e=>updateDemanda(d.id,{statusArte:e.target.value})}
                        style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:10,borderRadius:4,padding:"2px 6px",cursor:"pointer"}}>
                        {Object.entries(STATUS_ARTE).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── JP LOJA MODULE ───────────────────────────────────────────
function LojaJPModule({ dbStatus }) {
  const [staffTasks, setStaffTasks] = useState(
    JP_STAFF.reduce((acc,s)=>({...acc,[s.id]:[]}),{})
  );
  const [activeStaff, setActiveStaff] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({titulo:"",prioridade:"Alta",status:"nao_iniciado",prazo:"",observacao:""});

  useEffect(() => {
    if (dbStatus !== "ok") return;
    sb.get("loja_jp", "?select=*&order=created_at.desc").then(rows => {
      if (rows && rows.length) {
        setStaff(prev => prev.map(s => ({
          ...s,
          tasks: rows.filter(r=>r.staff_id===s.id).map(r=>({
            id:r.id, titulo:r.titulo, prioridade:r.prioridade,
            status:r.status, prazo:r.prazo||"", observacao:r.observacao||"",
          })),
        })));
      }
    }).catch(()=>{});
  }, [dbStatus]);

  function addTask(staffId) {
    if(!newTask.titulo.trim()) return;
    setStaffTasks(prev=>({...prev,[staffId]:[...prev[staffId],{...newTask,id:Date.now(),criadoEm:TODAY.toISOString().slice(0,10)}]}));
    setNewTask({titulo:"",prioridade:"Alta",status:"nao_iniciado",prazo:"",observacao:""});
    setShowForm(false);
  }

  function updateTask(staffId,taskId,updates) {
    setStaffTasks(prev=>({...prev,[staffId]:prev[staffId].map(t=>t.id===taskId?{...t,...updates}:t)}));
  }

  const totalOpen = Object.values(staffTasks).flat().filter(t=>t.status!=="concluido"&&t.status!=="cancelado").length;
  const totalDone = Object.values(staffTasks).flat().filter(t=>t.status==="concluido").length;

  return (
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:20,fontWeight:800,color:C.textPrimary,letterSpacing:"-0.02em"}}>🏠 Loja JP — João Pessoa</div>
        <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>Unidade 01 · Equipe de 4 funcionários · {totalOpen} tarefas abertas · {totalDone} concluídas</div>
      </div>

      {/* Staff cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
        {JP_STAFF.map(staff=>{
          const tasks = staffTasks[staff.id]||[];
          const open = tasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
          const isActive = activeStaff===staff.id;
          return (
            <div key={staff.id} style={{background:C.card,border:`1px solid ${isActive?staff.cor:C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
              <div onClick={()=>setActiveStaff(isActive?null:staff.id)}
                style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`${staff.cor}22`,border:`2px solid ${staff.cor}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:staff.cor}}>
                    {staff.nome[0]}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{staff.nome}</div>
                    <div style={{fontSize:11,color:staff.cor}}>{staff.funcao}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:open.length>0?C.amarelo:C.verde}}>{open.length}</div>
                  <div style={{fontSize:9,color:C.textMuted}}>abertas</div>
                </div>
              </div>

              {isActive&&(
                <div style={{borderTop:`1px solid ${C.cardBorder}`,padding:"10px 14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:11,color:C.textMuted}}>{open.length} aberta(s)</span>
                    <button onClick={()=>setShowForm(staff.id)} style={{background:"none",border:`1px solid ${staff.cor}`,color:staff.cor,fontSize:10,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontFamily:"inherit"}}>+ Tarefa</button>
                  </div>

                  {showForm===staff.id&&(
                    <div style={{background:C.inset,borderRadius:8,padding:10,marginBottom:8}}>
                      <input value={newTask.titulo} onChange={e=>setNewTask({...newTask,titulo:e.target.value})} placeholder="Título da tarefa" style={{...inputSt,marginBottom:6}} />
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                        <select value={newTask.prioridade} onChange={e=>setNewTask({...newTask,prioridade:e.target.value})} style={inputSt}>
                          <option>Alta</option><option>Média</option><option>Baixa</option>
                        </select>
                        <input type="date" value={newTask.prazo} onChange={e=>setNewTask({...newTask,prazo:e.target.value})} style={inputSt} />
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>addTask(staff.id)} style={btnSt(staff.cor,staff.cor==="#f9d856"?"#000":"#fff")}>Criar</button>
                        <button onClick={()=>setShowForm(null)} style={btnSt("transparent",C.textMuted)}>×</button>
                      </div>
                    </div>
                  )}

                  {tasks.length===0?(
                    <div style={{fontSize:11,color:C.textMuted,textAlign:"center",padding:"12px 0"}}>Sem tarefas</div>
                  ):(
                    tasks.map(t=>{
                      const sc=STATUS_TASK[t.status];
                      return (
                        <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
                          <select value={t.status} onChange={e=>updateTask(staff.id,t.id,{status:e.target.value})}
                            style={{background:C.inset,border:`1px solid ${C.cardBorder}`,color:sc.color,fontSize:9,borderRadius:4,padding:"1px 3px",cursor:"pointer",flexShrink:0,marginTop:2}}>
                            {Object.entries(STATUS_TASK).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,color:t.status==="concluido"?C.textMuted:C.textPrimary,textDecoration:t.status==="concluido"?"line-through":"none"}}>{t.titulo}</div>
                            {t.prazo&&<div style={{fontSize:9,color:C.textMuted}}>até {fmtDate(t.prazo)}</div>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* JP quick stats */}
      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Resumo Loja JP</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {label:"Total peças",value:"523",color:C.textPrimary},
            {label:"Disponíveis",value:"267",color:C.verde},
            {label:"Em manutenção",value:"83",color:C.red},
          ].map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:10,color:C.textMuted}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:11,color:C.textMuted,textAlign:"center"}}>
          Dados do sistema meuclubkids.com.br · Atualizado 03/06/2026 · 
          <a href="#" style={{color:C.azul,textDecoration:"none",marginLeft:4}}>Módulo manutenção JP →</a>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PANEL ───────────────────────────────────────────────
// ─── ACOMPANHAMENTO 360° ─────────────────────────────────────
const CANAIS_CONTATO = ["WhatsApp","Instagram","Reunião (Meet)","Ligação","Visita","Email"];
const CANAL_ICON = { "WhatsApp":"💬","Instagram":"📸","Reunião (Meet)":"🎥","Ligação":"📞","Visita":"🏠","Email":"✉️","Agendamento":"📅","Grupo WhatsApp":"💬" };

function genUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c==="x"?r:(r&0x3|0x8); return v.toString(16);
  });
}

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

function DiagnosticoSection({ unit, onAddTask, dbStatus }) {
  const [diag, setDiag] = useState(DIAG_DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(()=>{
    let alive = true;
    setLoaded(false); setDiag(DIAG_DEFAULT); setDirty(false); setSavedAt(null);
    (async()=>{
      try {
        const rows = await sb.get("unit_diagnostico", `?unit_id=eq.${unit.id}&limit=1`);
        if(alive&&rows&&rows[0]) setDiag({...DIAG_DEFAULT,...rows[0]});
      } catch(e){ /* tabela pode não existir ainda */ }
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

function AcompanhamentoView({ units, onUpdateUnit }) {
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
          <DiagnosticoSection unit={unit} onAddTask={addQuickTask} />

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

function PanelView({ units, onSelectUnit }) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterContact, setFilterContact] = useState("Todos");
  const [filterCarteira, setFilterCarteira] = useState("Todos");

  const filtered = useMemo(()=>units.filter(u=>{
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.franchiseeName.toLowerCase().includes(search.toLowerCase());
    const mg = filterGroup==="Todos" || u.group===filterGroup;
    const days = u.lastContactDate?daysSince(u.lastContactDate):999;
    const thresh = GROUP_CFG[u.group]?.freq||10;
    const mc = filterContact==="Todos" || (filterContact==="Atrasado"&&days>=thresh) || (filterContact==="Em dia"&&days<thresh);
    const mk = filterCarteira==="Todos" || u.responsible===filterCarteira;
    return ms&&mg&&mc&&mk;
  }),[units,search,filterGroup,filterContact,filterCarteira]);

  return (
    <div style={{padding:"12px 14px"}}>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar unidade..." style={{...inputSt,width:"100%",maxWidth:280}} />
        {["Todos","BERÇÁRIO","G1","G2","G3","G4"].map(g=>(
          <button key={g} onClick={()=>setFilterGroup(g)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterGroup===g?C.laranja:C.cardBorder}`,
            background:filterGroup===g?`${C.laranja}22`:"transparent",
            color:filterGroup===g?C.laranja:C.textMuted,
          }}>{g}</button>
        ))}
        <button onClick={()=>setFilterContact(filterContact==="Atrasado"?"Todos":"Atrasado")} style={{
          padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
          border:`1px solid ${filterContact==="Atrasado"?C.red:C.cardBorder}`,
          background:filterContact==="Atrasado"?`${C.red}22`:"transparent",
          color:filterContact==="Atrasado"?C.red:C.textMuted,
        }}>🔴 Contato atrasado</button>
        {["Todos","Ivanise","Will"].map(k=>(
          <button key={k} onClick={()=>setFilterCarteira(k)} style={{
            padding:"4px 10px",borderRadius:16,fontSize:11,cursor:"pointer",fontFamily:"inherit",
            border:`1px solid ${filterCarteira===k?C.azul:C.cardBorder}`,
            background:filterCarteira===k?`${C.azul}22`:"transparent",
            color:filterCarteira===k?C.azul:C.textMuted,
          }}>{k==="Todos"?"👥 Todos":k==="Ivanise"?"🟠 Ivanise":"🔵 Will"}</button>
        ))}
      </div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>{filtered.length} de {units.length} unidades</div>

      <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <table style={{width:"100%",minWidth:520,borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.cardBorder}`}}>
              {["Unidade","Grupo","Fat. Mai/26","Meta Jun/26","Último contato","Tarefas","Resp."].map(h=>(
                <th key={h} style={{padding:"8px 10px",fontSize:9,color:C.textMuted,textAlign:"left",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>{
              const openT=(u.tasks||[]).filter(t=>t.status!=="concluido"&&t.status!=="cancelado");
              const overdueT=openT.filter(t=>t.meetingData&&daysSince(t.meetingData)>14);
              const daysAgo=u.lastContactDate?daysSince(u.lastContactDate):null;
              return (
                <tr key={u.id} onClick={()=>onSelectUnit(u)}
                  style={{borderBottom:`1px solid ${C.cardBorder}`,cursor:"pointer",transition:"background 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"9px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <Semaphore unit={u} />
                      <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>{u.name}</span>
                      {u.group==="BERÇÁRIO"&&<span style={{fontSize:9,color:C.bercario}}>({u.daysInBercario}d)</span>}
                    </div>
                  </td>
                  <td style={{padding:"9px 8px"}}><GroupBadge group={u.group} small /></td>
                  <td style={{padding:"9px 8px",textAlign:"right"}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.textPrimary}}>{fmtBRL(u.fatMai)}</span>
                  </td>
                  <td style={{padding:"9px 8px",minWidth:90}}>
                    <div style={{fontSize:9,color:C.textMuted,marginBottom:2,display:"flex",justifyContent:"space-between"}}>
                      <span>{u.metaProgress}%</span><span>{fmtBRL(u.metaJun)}</span>
                    </div>
                    <ProgressBar pct={u.metaProgress} />
                  </td>
                  <td style={{padding:"9px 8px",textAlign:"center"}}>
                    {daysAgo===null?<span style={{fontSize:10,color:C.red}}>Sem contato</span>:
                      <span style={{fontSize:11,color:daysAgo===0?C.verde:C.textMuted}}>{daysAgo===0?"Hoje":`${daysAgo}d`}</span>}
                  </td>
                  <td style={{padding:"9px 8px",textAlign:"center"}}>
                    {openT.length>0?<span style={{fontSize:11,fontWeight:700,color:overdueT.length>0?C.red:C.textMuted}}>{openT.length}{overdueT.length>0?` ⚠️${overdueT.length}`:""}</span>:
                      <span style={{fontSize:11,color:C.cardBorder}}>—</span>}
                  </td>
                  <td style={{padding:"9px 8px"}}>
                    <span style={{fontSize:11,color:C.textMuted}}>{u.responsible}</span>
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

// ─── STATS BAR ───────────────────────────────────────────────
function StatsBar({ units }) {
  const bercarios=units.filter(u=>u.group==="BERÇÁRIO").length;
  const g1=units.filter(u=>u.group==="G1").length;
  const g2=units.filter(u=>u.group==="G2").length;
  const g3=units.filter(u=>u.group==="G3").length;
  const g4=units.filter(u=>u.group==="G4").length;
  const needContact=units.filter(u=>{
    const d=u.lastContactDate?daysSince(u.lastContactDate):999;
    return d>=(GROUP_CFG[u.group]?.freq||10);
  }).length;
  const allTasks=units.flatMap(u=>u.tasks||[]);
  const openTasks=allTasks.filter(t=>t.status!=="concluido"&&t.status!=="cancelado").length;
  const overdueTasks=allTasks.filter(t=>t.status!=="concluido"&&t.meetingData&&daysSince(t.meetingData)>14).length;

  const stats=[
    {label:"Total",value:units.length,color:C.textPrimary},
    {label:"Berçário",value:bercarios,color:C.bercario},
    {label:"G1",value:g1,color:C.laranja},
    {label:"G2",value:g2,color:C.verde},
    {label:"G3",value:g3,color:C.azul},
    {label:"G4",value:g4,color:C.red},
    {label:"S/ contato",value:needContact,color:needContact>10?C.red:C.amareloTxt},
    {label:"Tarefas",value:openTasks,color:overdueTasks>0?C.red:C.textMuted},
  ];

  return (
    <div style={{
      display:"flex", borderBottom:`1px solid ${C.cardBorder}`,
      background:C.card,
      overflowX:"auto", scrollbarWidth:"none", msOverflowStyle:"none",
    }}>
      {stats.map(s=>(
        <div key={s.label} style={{
          padding:"6px 12px", borderRight:`1px solid ${C.cardBorder}`,
          flexShrink:0, minWidth:52, textAlign:"center",
        }}>
          <div style={{fontSize:15,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
          <div style={{fontSize:8,color:C.textMuted,whiteSpace:"nowrap",marginTop:2}}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── BOTTOM NAV (mobile) ──────────────────────────────────────
const NAV_ITEMS = [
  {id:"panel",    emoji:"📊", label:"Painel"},
  {id:"acomp",    emoji:"🎯", label:"Acompanhamento"},
  {id:"usuarios", emoji:"👥", label:"Usuários"},
  {id:"carteira", emoji:"💼", label:"Carteira"},
  {id:"cadastro", emoji:"🏪", label:"Cadastro de unidades"},
  {id:"aniversarios", emoji:"🎂", label:"Aniversariantes"},
  {id:"dashboard",emoji:"🏠", label:"Dashboard"},
  {id:"diario",   emoji:"📓", label:"Diário"},
  {id:"manutencao",emoji:"🔧",label:"Manutenção"},
  {id:"print3d",  emoji:"🖨️", label:"3D"},
  {id:"campanhas",emoji:"📣", label:"Campanhas"},
  {id:"inauguracao",emoji:"🐣",label:"Inaug."},

  {id:"lojajp",   emoji:"🏪", label:"Loja JP"},
];

// Groups for the nav drawer
const NAV_GROUPS = [
  { label:"Principal",   items:["panel","acomp","dashboard","diario"] },
  { label:"Gestão",      items:["usuarios","carteira","cadastro","aniversarios"] },
  { label:"Operacional", items:["manutencao","print3d","lojajp"] },
  { label:"Rede",        items:["campanhas","inauguracao"] },
];


// ─── LOGO CLUBKIDS (peça de puzzle oficial) ──────────────────
function CKLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{flexShrink:0}}>
      <rect x="8" y="22" width="46" height="56" rx="12" stroke="#1a1a1a" strokeWidth="7" fill="none"/>
      <path d="M31 22v-6a6.5 6.5 0 0113 0v6" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <rect x="46" y="38" width="40" height="40" rx="10" fill="#1a1a1a"/>
      <circle cx="58" cy="50" r="5" fill="#f4edd6"/>
      <circle cx="74" cy="50" r="5" fill="#f4edd6"/>
      <circle cx="58" cy="66" r="5" fill="#f4edd6"/>
      <circle cx="74" cy="66" r="5" fill="#f4edd6"/>
    </svg>
  );
}

function CKWordmark({ size = 15 }) {
  return (
    <span style={{fontSize:size, color:"#1a1a1a", letterSpacing:"-0.3px", fontWeight:400}}>
      club<span style={{fontWeight:800}}>kids</span>
    </span>
  );
}

function TopBar({ activeTab, setActiveTab, dbStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = NAV_ITEMS.find(n=>n.id===activeTab);

  return (
    <>
      {/* Top bar */}
      <div style={{
        height:54, borderBottom:`1.5px solid ${C.cardBorder}`,
        display:"flex", alignItems:"center", padding:"0 14px",
        position:"sticky", top:0, background:C.card, zIndex:200,
        gap:10,
      }}>
        {/* Hamburger */}
        <button onClick={()=>setMenuOpen(true)} style={{
          background:"none", border:`1px solid ${C.cardBorder}`,
          borderRadius:8, color:C.textPrimary, width:36, height:36,
          cursor:"pointer", fontSize:16, display:"flex",
          alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>☰</button>

        {/* Brand */}
        <CKLogo size={28} />
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"center", gap:7}}>
            <CKWordmark size={15} />
            <span style={{fontSize:9, fontWeight:600, color:"#7a6e5a", background:C.bg, border:`1px solid #d9d0bc`, borderRadius:20, padding:"2px 8px"}}>Flow CRM</span>
            <span style={{
              fontSize:9, fontWeight:600, padding:"2px 8px", borderRadius:20,
              background: dbStatus==="ok"?"#e8f5ee":dbStatus==="offline"?"#fff8e1":C.inset,
              color: dbStatus==="ok"?"#2a7a52":dbStatus==="offline"?"#8a6a00":C.textMuted,
              border:`1px solid ${dbStatus==="ok"?"#b0ddc3":dbStatus==="offline"?"#f0dfa0":C.cardBorder}`,
            }}>
              {dbStatus==="ok"?"☁️ nuvem":dbStatus==="offline"?"⚠️ local":"⏳"}
            </span>
          </div>
          {/* Current section indicator */}
          <div style={{fontSize:10, color:C.textMuted, marginTop:1}}>
            {active?.emoji} {active?.label}
          </div>
        </div>

        {/* Quick nav — most used tabs as icon buttons */}
        <div style={{display:"flex", gap:4, flexShrink:0}}>
          {["panel","acomp","cadastro","dashboard"].map(id=>{
            const n = NAV_ITEMS.find(x=>x.id===id);
            return (
              <button key={id} onClick={()=>setActiveTab(id)} style={{
                width:34, height:34, borderRadius:8,
                border:`1px solid ${activeTab===id ? C.laranja : C.cardBorder}`,
                background: activeTab===id ? "#fff3e6" : "transparent",
                color: activeTab===id ? C.laranja : C.textMuted,
                cursor:"pointer", fontSize:16,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>{n?.emoji}</button>
            );
          })}
        </div>
      </div>

      {/* Drawer overlay */}
      {menuOpen&&(
        <div style={{
          position:"fixed", inset:0, zIndex:500,
          display:"flex",
        }}>
          {/* Backdrop */}
          <div onClick={()=>setMenuOpen(false)} style={{
            position:"absolute", inset:0, background:"#3a302088",
          }}/>

          {/* Drawer */}
          <div style={{
            position:"relative", width:260, background:C.card,
            borderRight:`1px solid ${C.cardBorder}`,
            height:"100vh", overflowY:"auto",
            display:"flex", flexDirection:"column",
          }}>
            {/* Drawer header */}
            <div style={{
              padding:"16px 16px 12px",
              borderBottom:`1px solid ${C.cardBorder}`,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <CKLogo size={26} />
                <div>
                  <CKWordmark size={14} />
                  <div style={{fontSize:10, color:C.textMuted}}>Flow CRM Franquias CK</div>
                </div>
              </div>
              <button onClick={()=>setMenuOpen(false)} style={{
                background:"none", border:"none", color:C.textMuted,
                fontSize:20, cursor:"pointer", padding:4,
              }}>×</button>
            </div>

            {/* Nav groups */}
            <div style={{flex:1, padding:"8px 0"}}>
              {NAV_GROUPS.map(group=>(
                <div key={group.label} style={{marginBottom:8}}>
                  <div style={{
                    padding:"6px 16px 4px",
                    fontSize:9, fontWeight:700, color:C.textMuted,
                    textTransform:"uppercase", letterSpacing:"0.08em",
                  }}>{group.label}</div>
                  {group.items.map(id=>{
                    const n = NAV_ITEMS.find(x=>x.id===id);
                    const isActive = activeTab===id;
                    return (
                      <button key={id} onClick={()=>{setActiveTab(id);setMenuOpen(false);}} style={{
                        width:"100%", padding:"10px 16px",
                        background: isActive ? `${C.laranja}18` : "transparent",
                        border:"none",
                        borderLeft: isActive ? `3px solid ${C.laranja}` : "3px solid transparent",
                        color: isActive ? C.textPrimary : C.textMuted,
                        fontWeight: isActive ? 700 : 400,
                        fontSize:13, cursor:"pointer",
                        fontFamily:"inherit", textAlign:"left",
                        display:"flex", alignItems:"center", gap:10,
                      }}>
                        <span style={{fontSize:18}}>{n?.emoji}</span>
                        <span>{n?.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Drawer footer */}
            <div style={{
              padding:"12px 16px",
              borderTop:`1px solid ${C.cardBorder}`,
              fontSize:10, color:C.textMuted,
            }}>
              👤 Ivanise Leite · Supervisora Nacional
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MÓDULOS DE GESTÃO: Usuários · Carteira · Cadastro Unidades
// ═══════════════════════════════════════════════════════════

// Status de gestação/segmentação da unidade
const UNIT_STATUS_CFG = {
  em_inauguracao: { label: "🏗️ Em inauguração", color: C.amareloTxt, bg: "#fff8e1", fase: "Gestação" },
  bercario:       { label: "🐣 Berçário", color: C.bercario, bg: "#f0ebff", fase: "Gestação" },
  pos_inauguracao:{ label: "🌱 Pós-inauguração", color: C.verde, bg: "#e8f5ee", fase: "Gestação" },
  g1:             { label: "🏆 G1 Líder", color: C.laranja, bg: "#fff3e6", fase: "Operação" },
  g2:             { label: "🔥 G2 Aceleração", color: C.verde, bg: "#e8f5ee", fase: "Operação" },
  g3:             { label: "📈 G3 Potencial", color: C.azul, bg: "#eaeffa", fase: "Operação" },
  g4:             { label: "⚠️ G4 Crítica", color: C.red, bg: "#fdecea", fase: "Operação" },
};

const SEED_CADASTRO = [{"name": "PB - JOAO PESSOA", "responsavelOp": "FRANCISCO JÚNIOR", "cpf": "072380594-60", "cnpj": "31282443/0001-46", "razaoSocial": "CLUB KIDS COMÉRCIO E ALUGUEL DE BRINQUEDOS", "endereco": "Av. Acre, 215 - Bairro dos Estados", "cep": "58030-230", "telefonePessoal": "68999547212", "telefoneAtendimento": "8391910440", "email": "diretoriaoperacional@franquiasclubkids.com.br", "dataInauguracao": "2016-05-11", "statusUnidade": "g3", "isRepasse": false}, {"name": "RN - NATAL", "responsavelOp": "AUDERI DE LIMA F. H.", "cpf": "009.345.614-00", "cnpj": "29.932.608/0001-36", "razaoSocial": "A DE LIMA FILHO BRINQUEDOS LTDA", "endereco": "Av. Maria Lacerda Montenegro, 2204 - Nova Parnamirim, Parnamirim-RN", "cep": "59152-600", "telefonePessoal": "84987723896", "telefoneAtendimento": "84988762370", "email": "clubkidsnatal@gmail.com", "dataInauguracao": "2018-03-19", "statusUnidade": "g3", "isRepasse": false}, {"name": "PB - CAMPINA GRANDE", "responsavelOp": "FELIPE AUGUSTO BARBOSA TAVARES", "cpf": "007528364-63", "cnpj": "30186908/0001-00", "razaoSocial": "FELIPE AUGUSTO BARBOSA TAVARES", "endereco": "Rua Cônego Pequeno, 490, apt 1906, Bela Vista, Campina Grande - PB", "cep": "58428-740", "telefonePessoal": "83996816518", "telefoneAtendimento": "83987830302", "email": "clubkidscampina@gmail.com", "dataInauguracao": "2018-05-14", "statusUnidade": "g3", "isRepasse": false}, {"name": "RN - MOSSORÓ", "responsavelOp": "MARIA STELLA GURGEL", "cpf": "7237326473", "cnpj": "64.718.762/0001-00", "razaoSocial": "64.718.762 PLAUTO LUAN PEREIRA VITORINO", "endereco": "ALBERTO MARANHAO, 1820, SALA 02, CENTRO, MOSSORO, RN", "cep": "59.600-195", "telefonePessoal": "84991983304", "telefoneAtendimento": "84999666621", "email": "clubkidsmossoro@gmail.com", "dataInauguracao": "2019-05-20", "statusUnidade": "g3", "isRepasse": false}, {"name": "AC - RIO BRANCO", "responsavelOp": "THAIS SECOTI BARIONI", "cpf": "927.710.922-04", "cnpj": "42.003.800/0001-06", "razaoSocial": "T S BARIONI", "endereco": "Eua primavera 182, baixa da colina, Rio Branco - AC", "cep": "69901-349", "telefonePessoal": "68999547212", "telefoneAtendimento": "68999194997", "email": "clubkidsriobranco@gmail.com", "dataInauguracao": "2020-08-24", "statusUnidade": "g3", "isRepasse": false}, {"name": "PE - GARANHUNS", "responsavelOp": "PATRÍCIA RAQUEL DIAS ARRUDA", "cpf": "025735424-75", "cnpj": "38065829/0001-45", "razaoSocial": "PATRICIA RAQUEL DIAS ARRUDA", "endereco": "Rua Professora Maria das Mercês Vieira, BR-424, KM 94, Boa Vista, Garanhuns/PE", "cep": "55292-715", "telefonePessoal": "87999030309", "telefoneAtendimento": "87996568915", "email": "clubkidsgaranhuns@gmail.com", "dataInauguracao": "2020-10-01", "statusUnidade": "g3", "isRepasse": false}, {"name": "PB - PATOS", "responsavelOp": "TACIANNE DE OLIVEIRA FERNANDES", "cpf": "06439598406", "cnpj": "54.005.296/0001-62", "razaoSocial": "JANE FERNANDES DA SILVA GOMES", "endereco": "RUA DEUSENITA ALVES DO NASCIMENTO, 500, SALGADINHO, PATOS, PB", "cep": "58706-645", "telefonePessoal": "83987676078", "telefoneAtendimento": "83987676078", "email": "clubkidspatos@gmail.com", "dataInauguracao": "2021-01-25", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - RIBEIRÃO PRETO", "responsavelOp": "MARIA JOSE MAZUCATO VERAGUAS", "cpf": "150.690.418-19", "cnpj": "48.382.340/0001-50", "razaoSocial": "48.382.340 MARIA JOSE MAZUCATO VERAGUAS", "endereco": "RUA FRANSCISCO ALVES, 697, JARDIM INTERLAGOS, RIBEIRÃO PRETO - SP", "cep": "14093-070", "telefonePessoal": "16981213586", "telefoneAtendimento": "16997468461", "email": "clubkidsrp@gmail.com", "dataInauguracao": "2025-05-19", "statusUnidade": "g3", "isRepasse": false}, {"name": "GO - GOIÂNIA", "responsavelOp": "MARÍLIA THEODORO DE CARVALHO DI RAIMO", "cpf": "000.563.131-95", "cnpj": "32556807000100", "razaoSocial": "MARILIA THEODORO DE CARVALHO DI RAIMO", "endereco": "Rua 13, 45, Ed. Winner Sport Life, apt 401 torre 1, Jardim Goiás, Goiânia - GO", "cep": "74810-170", "telefonePessoal": "85997270012", "telefoneAtendimento": "62995706634", "email": "Clubkidsgoiania@gmail.com", "dataInauguracao": "2021-08-14", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - SÃO JOSÉ DOS CAMPOS", "responsavelOp": "LAURA ARARUNA CLEMENTINO DE SOUZA", "cpf": "008767652-40", "cnpj": "42206105/0001-41", "razaoSocial": "LAURA ARARUNA CLEMENTINO DE SOUZA", "endereco": "Rua dos cajueiros, 87, Q39 L21. Residencial Terras do Vale, Caçapava - SP", "cep": "12235-180", "telefonePessoal": "47996520043", "telefoneAtendimento": "12981771791", "email": "clubkidssjc@gmail.com", "dataInauguracao": "2022-10-05", "statusUnidade": "g3", "isRepasse": false}, {"name": "MS - CAMPO GRANDE", "responsavelOp": "SÍLVIA LETÍCIA RAUPP DA COSTA DI RAIMO", "cpf": "938235411-53", "cnpj": "14282320/0001-96", "razaoSocial": "SILVIA LETICIA RAUPP DA COSTA DE RAIMO", "endereco": "Rua Flávio de Matos, 2462 Casa 03 Vila Morumbi - Campo Grande -MS", "cep": "79051-510", "telefonePessoal": "62993660909", "telefoneAtendimento": "67998747162", "email": "clubkidscampogrande@gmail.com", "dataInauguracao": "2022-10-29", "statusUnidade": "g3", "isRepasse": false}, {"name": "AP - MACAPÁ", "responsavelOp": "MIRELLI FEITOSA ARAÚJO PERAZOLI", "cpf": "026.397.902-42", "cnpj": "47.644.801/0001-53", "razaoSocial": "M. F. A. P. HOTELARIA LTDA", "endereco": "Rua Adilson José Pinto Pereira, 1101, São Lázaro - Macapá - AP", "cep": "68908-571", "telefonePessoal": "84912374408", "telefoneAtendimento": "96991166696", "email": "clubkidsmacapa@gmail.com", "dataInauguracao": "2022-12-16", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - PINHEIROS E BUTANTÃ", "responsavelOp": "MARCOS ALVES GARCIA", "cpf": "09464707828", "cnpj": "54.716.687/0001-95", "razaoSocial": "54.716.687 MARCOS ALVES GARCIA", "endereco": "RUA MARIA NAZARÉ SALLES DÁVILA, 15 A, VILA MENCK, OSASCO - SP", "cep": "06288-100", "telefonePessoal": "11993335678", "telefoneAtendimento": "11984514771", "email": "Clubkids.sp.oeste@gmail.com", "dataInauguracao": "2024-02-26", "statusUnidade": "g3", "isRepasse": false}, {"name": "PB - SANTA RITA E BAYEUX", "responsavelOp": "JOSÉ DE CARVALHO JÚNIOR", "cpf": "022273774-37", "cnpj": "50.019.535/0001-82", "razaoSocial": "JOSE DE CARVALHO JUNIOR", "endereco": "Av. Maria Rosa, 1165, apt 1101, Residencial Saint Germain, Manaíra, João Pessoa - PB", "cep": "58038-461", "telefonePessoal": "83996883288", "telefoneAtendimento": "83991678484", "email": "clubkidssantarita@gmail.com", "dataInauguracao": "2023-01-21", "statusUnidade": "g3", "isRepasse": false}, {"name": "RR - BOA VISTA", "responsavelOp": "KASSIA REGINA DE SOUSA SILVA", "cpf": "008.409.372-29", "cnpj": "50.725.777/0001-91", "razaoSocial": "50.725.777 KASSIA REGINA DE SOUSA SILVA", "endereco": "AVENIDA CARLOS PEREIRA DE MELO, 2320 - JARDIM FLORESTA - Boa Vista, Roraima.", "cep": "69312-005", "telefonePessoal": "31993227572", "telefoneAtendimento": "95991307770", "email": "Clubkidsboavista@gmail.com", "dataInauguracao": "2025-04-04", "statusUnidade": "g3", "isRepasse": false}, {"name": "PR - CURITIBA BATEL", "responsavelOp": "DAYANE CRISTINA BATISTA", "cpf": "376691008-69", "cnpj": "54202673/0001-53", "razaoSocial": "54.202.673 DAYANE CRISTINA BATISTA", "endereco": "RUA FRANKLIN SOARES GOMES, 139 - UBERARBA CURITIBA - PR", "cep": "81530-510", "telefonePessoal": "", "telefoneAtendimento": "41998312500", "email": "clubkidscuritiba.batel@gmail.com", "dataInauguracao": "2023-04-10", "statusUnidade": "g3", "isRepasse": false}, {"name": "TO - ARAGUAINA", "responsavelOp": "MILENA RODRIGUES MARTINS BEZERRA", "cpf": "003253612-74", "cnpj": "49439335/0001-08", "razaoSocial": "GHYLSONN LUIZ RIBEIRO", "endereco": "Rua Solimões, QD 20-C, Lt10, Vila Bragantina, Araguaína - TO", "cep": "77809-460", "telefonePessoal": "94988477040", "telefoneAtendimento": "63993116762", "email": "araguainaclubkids@gmail.com", "dataInauguracao": "2023-03-31", "statusUnidade": "g3", "isRepasse": false}, {"name": "PB - SOUSA", "responsavelOp": "BRUNA SYBELLE PEREIRA FAUSTINO GADELHA CAVALCANTE", "cpf": "074.616.804-71", "cnpj": "61.652.306/0001-17", "razaoSocial": "61.652.306 BRUNA SYBELLE PEREIRA FAUSTINO GADELHA CAVALCANTE", "endereco": "RUA LUIZ LUCIELIO FERREIRA, 29, GATO PRETO, SOUSA, PB", "cep": "58802-158", "telefonePessoal": "8393975590", "telefoneAtendimento": "83991247213", "email": "clubkidssousapb@gmail.com", "dataInauguracao": "2025-10-30", "statusUnidade": "g3", "isRepasse": false}, {"name": "CE - FORTALEZA MEIRELES", "responsavelOp": "ROBERTA BRENDA FREITAS FEITOSA", "cpf": "606238763-02", "cnpj": "49851556/0001-80", "razaoSocial": "ALEXANDRE DE SOUZA RIOS", "endereco": "Rua Luiza Miranda Coelho, 1130, Torre Flora, ap 1301, Eng. Luciano Cavalcante - CE", "cep": "60811-110", "telefonePessoal": "", "telefoneAtendimento": "85997520800", "email": "clubkidsfortaleza@gmail.com", "dataInauguracao": "2023-06-17", "statusUnidade": "g3", "isRepasse": false}, {"name": "PB - GUARABIRA", "responsavelOp": "YARIANNE MELO DE SOUSA GAMA CABRAL ARAÚJO", "cpf": "086384324-70", "cnpj": "26.926.532/0001-48", "razaoSocial": "26.926.532 MARIA LUCINEIDE NUNES ALVES", "endereco": "Rua Almir Azevedo, 26, Cond. Residencial Praça das Nogueiras, ap 1002, Várzea, Recife, PE", "cep": "50740-610", "telefonePessoal": "94984048457", "telefoneAtendimento": "83991150691", "email": "clubkidsguarabira@gmail.com", "dataInauguracao": "2023-07-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "PR - CASCAVEL", "responsavelOp": "DANIELE KARINA FERRARI DE OLIVEIRA", "cpf": "081002989-80", "cnpj": "50638192/0001-34", "razaoSocial": "Daniele Karina Ferrari de Oliveira", "endereco": "Rua Seringueira 225, bairro tropical, Cascavel", "cep": "85806-440", "telefonePessoal": "45988338386", "telefoneAtendimento": "45998471073", "email": "clubkidscascavel@gmail.com", "dataInauguracao": "2023-06-24", "statusUnidade": "g3", "isRepasse": false}, {"name": "RJ - NITEROI", "responsavelOp": "THAMIRIS AZEREDO VIANA", "cpf": "015011957-78", "cnpj": "50990093/0001-17", "razaoSocial": "cecilia goncalves teixeira", "endereco": "Rua Manoel Pacheco de carvalho, n4, bl1 apt702 Centro, Niterói RJ", "cep": "24436-510", "telefonePessoal": "83987676078", "telefoneAtendimento": "21970654788", "email": "clubkidsniteroi@gmail.com", "dataInauguracao": "2023-08-05", "statusUnidade": "g3", "isRepasse": false}, {"name": "RO - PORTO VELHO", "responsavelOp": "MARGARIDA FREIRES SANTANA/TAMIRES CUNHA", "cpf": "007.482.612-30", "cnpj": "62.396.220/0001-33", "razaoSocial": "62.396.220 TAMIRES CUNHA VITORIA DOS SANTOS", "endereco": "RUA PROFESSORA DOLLY CARVALHO, 8315, JUSCELINO KUBITSCHEK, PORTO VELHO, RO", "cep": "76829-334", "telefonePessoal": "69992587431", "telefoneAtendimento": "69993823502", "email": "clubkidsportovelhoro@gmail.com", "dataInauguracao": "2025-11-07", "statusUnidade": "g3", "isRepasse": false}, {"name": "MS - DOURADOS", "responsavelOp": "CAROLINA CARDOSO", "cpf": "009216111-10", "cnpj": "51496338/0001-17", "razaoSocial": "CAROLINA CARDOSO", "endereco": "Rua Ciro Melo, 986, Jardim Central, DOURADOS-MS", "cep": "79805-031", "telefonePessoal": "83996311904", "telefoneAtendimento": "67992310999", "email": "clubkidsdourados@gmail.com", "dataInauguracao": "2023-10-10", "statusUnidade": "g3", "isRepasse": false}, {"name": "PR - CURITIBA AHU", "responsavelOp": "BRUNO MOHAD BRANDINI", "cpf": "059326279-48", "cnpj": "51482319/0001-31", "razaoSocial": "BRUNO MOHAD BRANDINI", "endereco": "Rua Eça de Queiroz, 01160, Ed. Ponciana R, ap 101, Ahú, CURITIBA-PR", "cep": "80540-140", "telefonePessoal": "87988630816", "telefoneAtendimento": "41988807171", "email": "clubkidscuritiba.ahu@gmail.com", "dataInauguracao": "2023-09-02", "statusUnidade": "g3", "isRepasse": false}, {"name": "RJ - JACAREPAGUA", "responsavelOp": "RODRIGO CEZAR MARQUES", "cpf": "13665853729", "cnpj": "41.035.583/0001-73", "razaoSocial": "RODRIGO CEZAR MARQUES", "endereco": "Estrada dos Três Rios, 1245, apt 604 bloco 3, Freguesia Jacarepaguá, RJ", "cep": "22.745-004", "telefonePessoal": "", "telefoneAtendimento": "21967201866", "email": "clubkidsrj.jacarepagua@gmail.com", "dataInauguracao": "2023-10-01", "statusUnidade": "g3", "isRepasse": false}, {"name": "MG - UBERLÂNDIA", "responsavelOp": "DAYANNE REYNAUD ALARCAO", "cpf": "082968446-80", "cnpj": "55657733000195", "razaoSocial": "55.657.733 ENICE GUADALUPE REYNAUD ALARCAO", "endereco": "Rua João Balbino, 1753, apt 801, Santa Mônica, UBERLÂNDIA-MG", "cep": "38408-265", "telefonePessoal": "34995400055", "telefoneAtendimento": "34996915030", "email": "clubkidsuberlandia@gmail.com", "dataInauguracao": "2025-03-21", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - MARILIA", "responsavelOp": "CAMILA NOGUEIRA DE LIMA HILA", "cpf": "289444598-94", "cnpj": "52610248/0001-78", "razaoSocial": "CAMILA NOGUEIRA DE LIMA HILA", "endereco": "Rua Antônio Artencio, 260, MARILIA/SP", "cep": "17526-775", "telefonePessoal": "14998547279", "telefoneAtendimento": "14998547279", "email": "clubkidsmarilia@gmail.com", "dataInauguracao": "2024-04-08", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - ARARAQUARA", "responsavelOp": "ANA PAULA FORTE COSTA", "cpf": "21966629842", "cnpj": "20.730.375/0001-14", "razaoSocial": "ANA PAULA FORTE COSTA", "endereco": "Av Professor Habibe Khodor, 228, Jardim Biagioni - Araraquara", "cep": "14802100", "telefonePessoal": "16981838759", "telefoneAtendimento": "16997258759", "email": "clubkidsararaquara@gmail.com", "dataInauguracao": "2023-11-01", "statusUnidade": "g3", "isRepasse": false}, {"name": "BA - FEIRA DE SANTANA", "responsavelOp": "GLENIO RICARDO", "cpf": "007.471.770-74", "cnpj": "55.103.788/0001-53", "razaoSocial": "55.103.788 GLENIO RICARDO SILVA DA ROCHA", "endereco": "RUA CHARLETON, 475, SANTO ANTONIO DOS PRAZERES, FEIRA DE SANTANA, BA", "cep": "44071-752", "telefonePessoal": "75991983304", "telefoneAtendimento": "75981933223", "email": "clubkidsfeiradesantana@gmail.com", "dataInauguracao": "2023-12-01", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - VILA ANDRADE E CENTRO", "responsavelOp": "RENATA ALBERICO DOS SANTOS MELO", "cpf": "342.268.688-62", "cnpj": "52641737/0001-97", "razaoSocial": "CLUB KIDS SAO PAULO - CENTRO - SUL", "endereco": "Rua Frederico Guarinon, 400, ap 81, Jardim Ampliação, SP", "cep": "05713-460", "telefonePessoal": "45999501073", "telefoneAtendimento": "11964180187", "email": "clubkidsvilaandradecentro@gmail.com", "dataInauguracao": "2024-01-12", "statusUnidade": "g3", "isRepasse": false}, {"name": "PA - ITAITUBA", "responsavelOp": "LUCIA EVELYN NUNES CHARIFE", "cpf": "018.682.862-40", "cnpj": "53009487/0001-30", "razaoSocial": "LUCIA EVELYN NUNES CHARIFE", "endereco": "Rua Décima, 146, Itaituba/PA", "cep": "68181-140", "telefonePessoal": "41992088156", "telefoneAtendimento": "93991705688", "email": "clubkidsitaituba@gmail.com", "dataInauguracao": "2024-07-10", "statusUnidade": "g3", "isRepasse": false}, {"name": "PA - BELÉM UMARIZAL", "responsavelOp": "PABLO CARDIAS SOARES", "cpf": "93723784291", "cnpj": "52897952/0001-53", "razaoSocial": "PABLO CARDIAS SOARES", "endereco": "Rua Boaventura da Silva, 1227 apt 2401 ed Río San Juan", "cep": "66060060", "telefonePessoal": "91999011561", "telefoneAtendimento": "91991252711", "email": "clubkidsbelem.umarizal@gmail.com", "dataInauguracao": "2024-05-11", "statusUnidade": "g3", "isRepasse": false}, {"name": "MA - SÃO LUIS", "responsavelOp": "RICARDO MARQUES CARVALHO", "cpf": "919.898.333-49", "cnpj": "52996580/0001-12", "razaoSocial": "FLAVIA ARAUJO FIGUEIREDO", "endereco": "Av. São Luis Rei de Franca, 48 ap 201 TURU - São Luis/MA", "cep": "65065-470", "telefonePessoal": "98999374940", "telefoneAtendimento": "98988793426", "email": "clubkidssaoluiscohama@gmail.com", "dataInauguracao": "2024-04-10", "statusUnidade": "g3", "isRepasse": false}, {"name": "BA - SALVADOR PITUBA", "responsavelOp": "DANILO ALMEIDA DE OLIVEIRA", "cpf": "025.449.155-36", "cnpj": "52945744/0001-82", "razaoSocial": "SANDRA MARCIA ALMEIDA DE OLIVEIRA", "endereco": "Alameda Zumira Ferreira, 42 ap 009, Saboeiro/BA", "cep": "41180-335", "telefonePessoal": "71998011313", "telefoneAtendimento": "71983163207", "email": "clubkidssalvadorpituba@gmail.com", "dataInauguracao": "2024-02-04", "statusUnidade": "g3", "isRepasse": false}, {"name": "BA - LAURO DE FREITAS", "responsavelOp": "GEORGEA DE JESUS ARAGÃO DE OLIVEIRA", "cpf": "033.054.105-66", "cnpj": "52923090/0001-96", "razaoSocial": "GEORGEA DE JESUS ARAGÃO DE OLIVEIRA", "endereco": "Rua Doutor Gerino de Souza Filho, 420, CAIXA D'ÁGUA", "cep": "42711-830", "telefonePessoal": "71988213407", "telefoneAtendimento": "71984694802", "email": "clubkidslaurodefreitas@gmail.com", "dataInauguracao": "2024-04-27", "statusUnidade": "g3", "isRepasse": false}, {"name": "TO - PALMAS", "responsavelOp": "CIBELLE GOMES QUINTAS TOLEDO", "cpf": "011.127.391-90", "cnpj": "53599696/0001-80", "razaoSocial": "CIBELLE GOMES QUINTAS TOLEDO", "endereco": "1205 SUL, ARSO 122, ALAMEDA 22, QD 18, LT42, PLANO DIRETOR SUL", "cep": "77024-480", "telefonePessoal": "63988213407", "telefoneAtendimento": "63992937220", "email": "clubkidspalmasto@gmail.com", "dataInauguracao": "2024-05-18", "statusUnidade": "g3", "isRepasse": false}, {"name": "RJ - RESENDE", "responsavelOp": "RAPHAEL RODRIGUES DA SILVEIRA", "cpf": "08943110774", "cnpj": "42762844000110", "razaoSocial": "RAPHAEL RODRIGUES DA SILVEIRA", "endereco": "Travessa Nelson Chaves Ritton 29 casa 15 Parque Ipiranga Resende RJ", "cep": "27516175", "telefonePessoal": "21964184542", "telefoneAtendimento": "24999837221", "email": "clubkidsresende@gmail.com", "dataInauguracao": "2024-03-30", "statusUnidade": "g3", "isRepasse": false}, {"name": "MG - JUIZ DE FORA", "responsavelOp": "RUTH ROCHA LOPES TEIXEIRA", "cpf": "051.618.554-36", "cnpj": "61.737.464/0001-70", "razaoSocial": "61.737.464 RUTH ROCHA LOPES TEIXEIRA", "endereco": "Rua Dr Eduardo de Menezes, 455, apto 302, São Mateus, Juiz de Fora, MG", "cep": "36016-420", "telefonePessoal": "83962173430", "telefoneAtendimento": "32999544444", "email": "clubkisjf@gmail.com", "dataInauguracao": "2025-11-05", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - BARUERI", "responsavelOp": "MARAIZA SILVA GOMES KUWANA", "cpf": "034.499.841-01", "cnpj": "54061995/0001-20", "razaoSocial": "CLUBKIDS BARUERI", "endereco": "ALAMEDA TOPAZIO, 915, RESIDENCIAL ALPHAVILLE 9 SANTANA DE PARNAIBA, SP", "cep": "06414-025", "telefonePessoal": "11983351774", "telefoneAtendimento": "11995528084", "email": "clubkidsbarueri@gmail.com", "dataInauguracao": "2024-04-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "PR - FOZ DO IGUAÇU", "responsavelOp": "SIMONE HANZEN TOMAZZONI", "cpf": "047.311.419-40", "cnpj": "57845776/0001-20", "razaoSocial": "SIMONE HANZEN TOMAZZONI", "endereco": "R Franca, 1629 - Ipe, Foz do Iguaçu", "cep": "85869-671", "telefonePessoal": "", "telefoneAtendimento": "45988283364", "email": "clubkidsfozdoiguacu@gmail.com", "dataInauguracao": "2024-05-04", "statusUnidade": "g3", "isRepasse": false}, {"name": "PA - BELÉM 2", "responsavelOp": "ANA CLAUDIA FELIPE DO COUTO PENIN", "cpf": "832995641-53", "cnpj": "40896671/0001-05", "razaoSocial": "ANA CLAUDIA FELIPE DO COUTO PENIN LTDA", "endereco": "AV GENERAL DEODORO, 1878, ED SAM GENNARO, AP 1702, NAZARÉ - BELÉM", "cep": "66040-140", "telefonePessoal": "21980215081", "telefoneAtendimento": "21996659247", "email": "clubkidsbelem.nana@gmail.com", "dataInauguracao": "2024-06-17", "statusUnidade": "g3", "isRepasse": false}, {"name": "CE - EUSÉBIO E AQUIRAZ", "responsavelOp": "FABRÍCIA REGES SOARES", "cpf": "021.086.103-75", "cnpj": "54651089/0001/85", "razaoSocial": "FABRÍCIA REGES SOARES", "endereco": "RUA MARIA QUINTINO, 700 CASA 08 - PARQUE SANTA MARIA - FORTALEZA/CE", "cep": "60873-010", "telefonePessoal": "85991765149", "telefoneAtendimento": "85994454874", "email": "clubkidseusebio@gmail.com", "dataInauguracao": "2024-05-17", "statusUnidade": "g3", "isRepasse": false}, {"name": "SC - BLUMENAU", "responsavelOp": "IVETE VENTURA CAMARGO", "cpf": "518.730.959-53", "cnpj": "54.500.309/0001-70", "razaoSocial": "IVETE VENTURA CAMARGO", "endereco": "RUA JARDIM GERMANICO, 815 SALA 01", "cep": "89066-321", "telefonePessoal": "84999347910", "telefoneAtendimento": "47996351964", "email": "clubkidsblumenau@gmail.com", "dataInauguracao": "2024-06-01", "statusUnidade": "g3", "isRepasse": false}, {"name": "PE - RECIFE 2", "responsavelOp": "JANNE LUCIA TENORIO DE MORAIS CHAVES", "cpf": "026.728.214-10", "cnpj": "56365657000107", "razaoSocial": "56.365.657 JANNE LUCIA TENORIO DE MORAIS CHAVES", "endereco": "RUA VITORIA RÉGIA, 300, APTO 101, TORRE NORTE 3 POSITANO, PAIVA, CABO DE SANTO AGOSTINHO, PE", "cep": "54522-170", "telefonePessoal": "84991146833", "telefoneAtendimento": "81995400055", "email": "clubkidsrecife.zonasul@gmail.com", "dataInauguracao": "2024-05-18", "statusUnidade": "g3", "isRepasse": false}, {"name": "CE - JUAZEIRO DO NORTE", "responsavelOp": "ANNE COSMO ROCHA", "cpf": "089.292.814-00", "cnpj": "58.421.276/0001-23", "razaoSocial": "58.421.276 ANNE COSMO ROCHA", "endereco": "MARIA NELI GONCALVES, 45, FREI DAMIÃO, JUAZEIRO DO NORTE", "cep": "63043-240", "telefonePessoal": "8892753095", "telefoneAtendimento": "88994385656", "email": "clubkidsjuazeirodonortece01@gmail.com", "dataInauguracao": "2026-05-20", "statusUnidade": "pos_inauguracao", "isRepasse": false}, {"name": "SP - MOGI DAS CRUZES", "responsavelOp": "JOVANA SERRASQUEIRO INDALECIO BERTAIOLLI", "cpf": "367.959.708-84", "cnpj": "55.408.113/0001-12", "razaoSocial": "JOVANA SERRASQUEIRO INDALECIO BERTAIOLLI", "endereco": "Av. Dr. Benedicto Laporte Vieira da Motta, 201 - Apto 111 - Torre 1, Vila Mogilar - Mogi das Cruzes - SP", "cep": "08773-325", "telefonePessoal": "11991366022", "telefoneAtendimento": "11992565378", "email": "clubkidsmogidascruzes@gmail.com", "dataInauguracao": "2024-07-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "RJ - BARRA DA TIJUCA", "responsavelOp": "MARCOS ANTONIO FERNANDES", "cpf": "100.058.207-82", "cnpj": "55582741/0001-10", "razaoSocial": "MARCOS ANTONIO FERNANDES", "endereco": "Rua Patos de Minas, 51, Taquara, Rio de Janeiro - RJ", "cep": "22720-160", "telefonePessoal": "", "telefoneAtendimento": "21970372999", "email": "clubkidsrj.barradatijuca@gmail.com", "dataInauguracao": "2024-07-27", "statusUnidade": "g3", "isRepasse": false}, {"name": "PR - SÃO JOSÉ DOS PINHAIS", "responsavelOp": "GIOVANNA CARLA ERKMANN", "cpf": "02988214948", "cnpj": "57662680000126", "razaoSocial": "ARNO ERKMANN", "endereco": "Rua Marumby, 285, casa 5 - Campo Comprido, Curitiba/PR", "cep": "81220090", "telefonePessoal": "41996875979", "telefoneAtendimento": "41996875979", "email": "clubkidssaojosedospinhais@gmail.com", "dataInauguracao": "2024-08-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - SOROCABA", "responsavelOp": "ANDRÉ NEVER AMADIU", "cpf": "220.063.228-26", "cnpj": "53640737/0001-35", "razaoSocial": "RQA SUPER FANTASTICO COMERCIO DE BRINQUEDOS", "endereco": "RUA JOSÉ JOAQUIM DE LACERDA. 1435 JARDIM SOROCABANO, SOROCABA - SP", "cep": "18080-410", "telefonePessoal": "47992448669", "telefoneAtendimento": "15996471166", "email": "sorocabaclubkids@gmail.com", "dataInauguracao": "2024-08-01", "statusUnidade": "g3", "isRepasse": false}, {"name": "BA - VITORIA DA CONQUISTA", "responsavelOp": "GABRIELY DE PAULA OLIVEIRA", "cpf": "082.819.525-04", "cnpj": "58.868.420/0001-74", "razaoSocial": "58.868.420 GABRIELY DE PAULA OLIVEIRA", "endereco": "RUA DOUTOR RAIMUNDO BAHIA DA NOVA, 24, BAIRRO CANDEIAS, VITORIA DA CONQUISTA, BA", "cep": "45028-658", "telefonePessoal": "31982107032", "telefoneAtendimento": "77981152742", "email": "clubkidsvitoriadaconquista@gmail.com", "dataInauguracao": "2024-09-06", "statusUnidade": "g3", "isRepasse": false}, {"name": "MG - DIVINOPOLIS", "responsavelOp": "IZABEL ORMIANIN MONTEIRO", "cpf": "031.155.769-43", "cnpj": "55967621/0001-30", "razaoSocial": "IZABEL ORMIANIN MONTEIRO", "endereco": "Rua Camboriú, 310, Jardim Candelária - Divinópolis - MG", "cep": "35502105", "telefonePessoal": "81999570416", "telefoneAtendimento": "37991956642", "email": "clubkidsdivinopolis@gmail.com", "dataInauguracao": "2024-09-14", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - PRAIA GRANDE", "responsavelOp": "ANA LUCIA DE OLIVEIRA", "cpf": "080.625.308-84", "cnpj": "67.037.172/0001-00", "razaoSocial": "67.037.172 ANA LUCIA DE OLIVEIRA", "endereco": "RUA OTELO RODRIGUES FRANCO, 317, CANTO DO FORTE, PRAIA GRANDE, SP", "cep": "11700-700", "telefonePessoal": "13991291979", "telefoneAtendimento": "13998011313", "email": "clubkidssantossvpraiagrande@gmail.com", "dataInauguracao": "2026-05-28", "statusUnidade": "pos_inauguracao", "isRepasse": false}, {"name": "PR - LONDRINA", "responsavelOp": "ALINE MUNHOZ SANTANA DELALIBERA", "cpf": "072.637.429-69", "cnpj": "56424618/0001-33", "razaoSocial": "ALINE MUNHOZ SANTANA DELALIBERA", "endereco": "Rua Rev João Batista Ribeiro Neto, 75, ap 1201 Torre 2, Londrina PR", "cep": "86055-645", "telefonePessoal": "", "telefoneAtendimento": "43991231886", "email": "clubkidslondrina@gmail.com", "dataInauguracao": "2024-10-04", "statusUnidade": "g3", "isRepasse": false}, {"name": "SE - ARACAJU JARDINS", "responsavelOp": "MAURO MUNIZ BEZERRA", "cpf": "976.469.385-72", "cnpj": "57.017.787/0001-11", "razaoSocial": "MARTA LIMA CAMPOS BEZERRA", "endereco": "Av Melicio Machado, 3700 Rua I casa 21 - Aeroporto Aracaju - SE", "cep": "49038-443", "telefonePessoal": "", "telefoneAtendimento": "79996021412", "email": "clubkidsjardinsaracaju@gmail.com", "dataInauguracao": "2024-10-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "SC - JOINVILLE", "responsavelOp": "RENAN HENRIQUE REGUEIRA HEIDEMANN", "cpf": "04609371979", "cnpj": "57066019000158", "razaoSocial": "RENAN HENRIQUE REGUEIRA HEIDEMANN", "endereco": "Rua Adriano Shondermark. 98 ap 202 XC07 - Costa e Silva, Joinville, SC", "cep": "89217400", "telefonePessoal": "16991854949", "telefoneAtendimento": "47996467857", "email": "clubkidsjoinville@gmail.com", "dataInauguracao": "2024-10-10", "statusUnidade": "g3", "isRepasse": false}, {"name": "CE - FORTALEZA FÁTIMA", "responsavelOp": "VANIA LEMOS", "cpf": "456.261.463-34", "cnpj": "63.427.234/0001-30", "razaoSocial": "63.427.234 JULIA LEMOS DE FREITAS AGUIAR PONTE", "endereco": "Rua Padre Leopoldo Fernandes, 178, apto 1304, Fatima - Fortaleza - CE", "cep": "60411-180", "telefonePessoal": "12981437890", "telefoneAtendimento": "85985240584", "email": "clubkidsfatima@gmail.com", "dataInauguracao": "2025-03-07", "statusUnidade": "g3", "isRepasse": false}, {"name": "PI - TERESINA", "responsavelOp": "KARINA BORGES DE SOUSA", "cpf": "050.361.523-44", "cnpj": "40.684.638/0001-03", "razaoSocial": "PARA DECORAR LTDA", "endereco": "Av Elias João Tajra, 841, Fatima, Teresia - PI", "cep": "64049-300", "telefonePessoal": "11981367779", "telefoneAtendimento": "86994845677", "email": "clubkidsteresina.joquei@gmail.com", "dataInauguracao": "2024-11-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "MG - IPATINGA", "responsavelOp": "ARTHUR GONCALVES ASSINI", "cpf": "063.454.236-29", "cnpj": "37.189.215/0001-02", "razaoSocial": "37.189.215 ARTHUR GONCALVES ASSINI", "endereco": "AVENIDA CASTELO BRANCO, 300, HORTO, IPATINGA - MG", "cep": "35160-294", "telefonePessoal": "31991266500", "telefoneAtendimento": "31998229988", "email": "ck.ipatinga@gmail.com", "dataInauguracao": "2025-07-14", "statusUnidade": "g3", "isRepasse": false}, {"name": "SC - CHAPECÓ", "responsavelOp": "LYVIA FERNANDA BENEDET ZIMMERMANN", "cpf": "039.947.289-40", "cnpj": "57303274/0001-77", "razaoSocial": "LYVIA FERNANDA BENEDET ZIMMERMANN", "endereco": "Rua Henrique Bernardo Buss, 94-E Bairro Esplanada, Chapecó - SC", "cep": "89812-671", "telefonePessoal": "11982707272", "telefoneAtendimento": "49988110697", "email": "clubkidschapeco@gmail.com", "dataInauguracao": "2024-12-06", "statusUnidade": "g3", "isRepasse": false}, {"name": "MT - CUIABÁ", "responsavelOp": "CAMILA SOUZA DE ANGELI", "cpf": "032.563.991-42", "cnpj": "57.580.766/0001-00", "razaoSocial": "57.580.766 CAMILA SOUZA DE ANGELI", "endereco": "Travessa G, 138 - Andar 2, Bloco C Cond Piazza Florença, apt 2023", "cep": "78048-909", "telefonePessoal": "11998042913", "telefoneAtendimento": "65992408150", "email": "clubkidscuiaba@gmail.com", "dataInauguracao": "2024-10-15", "statusUnidade": "g3", "isRepasse": false}, {"name": "RJ - ILHA DO GOVERNADOR", "responsavelOp": "YASMIN SOARES TINOCO DOS REIS", "cpf": "10204112796", "cnpj": "58.863.171/0001-24", "razaoSocial": "58.863.171 LISANDRE DE FATIMA SANTOS DOS REIS", "endereco": "Rua Luís Sá, 305, Bl 1, AP 304 - Portuguesa - Rio de Janeiro", "cep": "21920-400", "telefonePessoal": "21980215081", "telefoneAtendimento": "21996659247", "email": "clubkidsilhadogovernador@gmail.com", "dataInauguracao": "2025-08-29", "statusUnidade": "g3", "isRepasse": false}, {"name": "RJ - VOLTA REDONDA", "responsavelOp": "TAIS ROCHA ALVES PERINA MOREIRA", "cpf": "145.808.187-76", "cnpj": "30336970/0001-23", "razaoSocial": "TAIS ROCHA PERINA MOREIRA", "endereco": "Rua c 11, bloco 2, APTO 206, Volta Redonda, RJ", "cep": "27250-042", "telefonePessoal": "11985999708", "telefoneAtendimento": "24992293131", "email": "clubkidsvoltaredonda@gmail.com", "dataInauguracao": "2024-12-02", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - PIRACICABA", "responsavelOp": "DANILO CHIODI", "cpf": "403.653.558-79", "cnpj": "57.725.375/0001-36", "razaoSocial": "57.725.375 DANILO CHIODI", "endereco": "AVENIDA RIO DAS PEDRAS, 2201 - APT 104; BLOCO 15 - Pompeia - Piracicaba - SP", "cep": "13425-380", "telefonePessoal": "19997731269", "telefoneAtendimento": "19989153475", "email": "clubkidspiracicaba@gmail.com", "dataInauguracao": "2024-12-19", "statusUnidade": "g3", "isRepasse": false}, {"name": "PE - RECIFE IMBIRIBEIRA", "responsavelOp": "MICHELI FERREIRA DOS SANTOS", "cpf": "034.183.614-12", "cnpj": "57.842.677/0001-94", "razaoSocial": "MICHELI FERREIRA DOS SANTOS", "endereco": "Rua Gonçalves de Magalhães, 398 - Imbiribeira - Recife - PE", "cep": "51190-602", "telefonePessoal": "16981838759", "telefoneAtendimento": "81998722015", "email": "clubkidsrecifeimbiribeira@gmail.com", "dataInauguracao": "2024-12-06", "statusUnidade": "g3", "isRepasse": false}, {"name": "SC - PALHOÇA SÃO JOSÉ", "responsavelOp": "ANA CLÁUDIA BARROS", "cpf": "009.134.009-80", "cnpj": "57812664/0001-72", "razaoSocial": "ANA CLAUDIA BARROS", "endereco": "Rua Fagundes Varela, 1187 ap 906 D, Areias, São José - SC", "cep": "88113800", "telefonePessoal": "48930826203", "telefoneAtendimento": "48999527493", "email": "clubkidssaojosesc@gmail.com", "dataInauguracao": "2024-11-22", "statusUnidade": "g3", "isRepasse": false}, {"name": "GO - RIO VERDE", "responsavelOp": "AMANDA DANIELI ROCHA DE SOUZA", "cpf": "36759898877", "cnpj": "58.005.821/0001-09", "razaoSocial": "Amanda Danieli Rocha de Souza", "endereco": "Rua Wolney da Costa Martins, Qd. 43, Lt. 14, Parte B, Residencial Maranata", "cep": "75911-001", "telefonePessoal": "64998011313", "telefoneAtendimento": "64993374766", "email": "clubkidsrioverdego@gmail.com", "dataInauguracao": "2024-12-19", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - IPIRANGA MOOCA", "responsavelOp": "NATHAN DEGAS BASSO", "cpf": "487.849.918-44", "cnpj": "58.345.642/0001-02", "razaoSocial": "58.345.642 NATHAN DEGAS BASSO", "endereco": "R LINO COUTINHO, 643 - IPIRANGA - SP", "cep": "04.207-000", "telefonePessoal": "11976678536", "telefoneAtendimento": "11965478833", "email": "clubkidsipiranga@gmail.com", "dataInauguracao": "2025-03-21", "statusUnidade": "g3", "isRepasse": false}, {"name": "SP - JAÚ", "responsavelOp": "MARCELA PALACIO DE SOUZA CANTARELLI", "cpf": "39450736855", "cnpj": "58.324.561/0001-26", "razaoSocial": "58.324.561 Marcela Palacio de Souza", "endereco": "Rua Torello Dinucci, 76, Vila Carvalho, Jaú/SP", "cep": "17.205-103", "telefonePessoal": "14981583127", "telefoneAtendimento": "14991852112", "email": "clubkidsjau@gmail.com", "dataInauguracao": "2025-01-24", "statusUnidade": "g3", "isRepasse": false}];

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Date.now() + "_" + Math.random().toString(36).slice(2,8);
}

// ─── 1. USUÁRIOS ─────────────────────────────────────────────
function UsuariosView({ usuarios, onSave, onDelete }) {
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
function CarteiraView({ usuarios, units, onAssign }) {
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

function CadastroUnidadesView({ units, usuarios, onSaveUnit, onImportClick }) {
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
function ImportFaturamentoModal({ units, onClose, onImport }) {
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
    } catch(err){ setHint("Não consegui ler o PDF. Digite o valor manualmente."); }
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


// Mescla dados cadastrais do seed (Google Sheets) nas unidades, por nome normalizado
function normName(s){ return (s||"").toUpperCase().replace(/[^A-Z0-9]/g,""); }
function mergeSeedCadastro(units){
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

const ANIV_FRANQUEADOS = [{"unidade": "RIO VERDE - GO", "franqueado": "Amanda Danieli Rocha de Souza", "dia": "30/01"}, {"unidade": "BARRA DA TIJUCA - RJ", "franqueado": "Marcos Henrique Freire de Brito Fernandes", "dia": "23/01"}, {"unidade": "CAMPINA GRANDE - PB", "franqueado": "Felipe Augusto Barbosa Tavares", "dia": "15/01"}, {"unidade": "RIO BRANCO - AC", "franqueado": "Eloisa Secoti Leal", "dia": "07/01"}, {"unidade": "SANTO ANDRÉ E CAETANO - SP", "franqueado": "Alexandre Augusto Rodrigues de Souza", "dia": "11/01"}, {"unidade": "TERESINA - PI", "franqueado": "Karina Borges de Sousa", "dia": "21/02"}, {"unidade": "ILHA DO GOVERNADOR - RJ", "franqueado": "Yasmin Tinoco", "dia": "11/02"}, {"unidade": "BLUMENAU - SC", "franqueado": "Ivete Ventura Camargo", "dia": "09/02"}, {"unidade": "FORTALEZA MEIRELES - CE", "franqueado": "Alexandre Rios", "dia": "10/02"}, {"unidade": "FOZ DO IGUAÇU - PR", "franqueado": "Simone Hanzen Tomazzoni", "dia": "16/02"}, {"unidade": "IPATINGA - MG", "franqueado": "Arthur Gonçalves Assini", "dia": "02/02"}, {"unidade": "SÃO JOSÉ DOS CAMPOS - SP", "franqueado": "Laura Araruna Clementino de Souza", "dia": "08/02"}, {"unidade": "PORTO VELHO - RO", "franqueado": "Margarida Freires Santana", "dia": "18/03"}, {"unidade": "BELÉM UMARIZAL - PA", "franqueado": "Pablo Cardias Soares", "dia": "06/03"}, {"unidade": "DOURADOS - MS", "franqueado": "Carolina Cardoso", "dia": "28/03"}, {"unidade": "DIVINOPOLIS - MG", "franqueado": "Izabel Ormianini Monteiro", "dia": "29/03"}, {"unidade": "NITEROI - RJ", "franqueado": "Marcus José Gonçalves Teixeira", "dia": "19/03"}, {"unidade": "CHAPECÓ - SC", "franqueado": "Lyvia Fernanda Benedet Zimmermann", "dia": "25/04"}, {"unidade": "FORTALEZA MEIRELES - CE", "franqueado": "Roberta Feitosa", "dia": "29/04"}, {"unidade": "ARARAQUARA - SP", "franqueado": "Ana Paula Forte Costa", "dia": "20/04"}, {"unidade": "CUIABÁ - MT", "franqueado": "Camila Souza De Angeli", "dia": "05/04"}, {"unidade": "SÃO JOSÉ DOS PINHAIS - PR", "franqueado": "Giovanna Carla Erkmann", "dia": "02/04"}, {"unidade": "VILA ANDRADE E CENTRO - SP", "franqueado": "Renata Melo", "dia": "13/04"}, {"unidade": "ITAITUBA - PA", "franqueado": "Lucia Evelyn Nunes Charife", "dia": "11/05"}, {"unidade": "JUIZ DE FORA - MG", "franqueado": "Ruth Rocha Lopes Teixeira", "dia": "21/05"}, {"unidade": "CASCAVEL - PR", "franqueado": "Daniele Karina Ferrari de Oliveira", "dia": "05/05"}, {"unidade": "CAMPINA GRANDE - PB", "franqueado": "Gitana Carla Soares de Assis Tavares", "dia": "19/05"}, {"unidade": "SANTA RITA E BAYEUX - PB", "franqueado": "José de Carvalho Júnior", "dia": "25/05"}, {"unidade": "JUAZEIRO DO NORTE - CE", "franqueado": "Mario Renan de Oliveira Romão", "dia": "28/05"}, {"unidade": "PATOS - PB", "franqueado": "Tacianne de Oliveira Fernandes", "dia": "29/05"}, {"unidade": "GUARABIRA - PB", "franqueado": "Yarianne Melo de Sousa Gama Cabral Araujo", "dia": "21/05"}, {"unidade": "JACAREPAGUA - RJ", "franqueado": "Rodrigo Cézar Marques", "dia": "24/05"}, {"unidade": "JOINVILLE - SC", "franqueado": "Renan Regueira Heidemann", "dia": "13/05"}, {"unidade": "LONDRINA - PR", "franqueado": "Alysson Delalibera", "dia": "30/05"}, {"unidade": "ITAITUBA - PA", "franqueado": "Lucia Evelyn Nunes Charife", "dia": "11/06"}, {"unidade": "JUAZEIRO DO NORTE - CE", "franqueado": "Anne Rocha", "dia": "02/06"}, {"unidade": "BOA VISTA - RR", "franqueado": "Kassia Regina de Sousa Silva", "dia": "06/06"}, {"unidade": "GOIÂNIA - GO", "franqueado": "Lorenzo Di Raimo Fernandes", "dia": "13/06"}, {"unidade": "VITORIA DA CONQUISTA - BA", "franqueado": "Jacqueline Brito de paula", "dia": "15/06"}, {"unidade": "CURITIBA BATEL - PR", "franqueado": "Dayane Batista", "dia": "27/06"}, {"unidade": "DIVINOPOLIS - MG", "franqueado": "Marcelo Antônio Mageste Vieira", "dia": "16/06"}, {"unidade": "NITEROI - RJ", "franqueado": "Thamiris Azeredo Viana", "dia": "04/06"}, {"unidade": "PALHOÇA SÃO JOSÉ - SC", "franqueado": "Ana Claudia Barros", "dia": "24/06"}, {"unidade": "BOA VISTA - RR", "franqueado": "Weverton Augusto Campos ferreira", "dia": "23/07"}, {"unidade": "JUAZEIRO DO NORTE - CE", "franqueado": "Jamille Ferreira Leandro", "dia": "17/07"}, {"unidade": "DIVINOPOLIS - MG", "franqueado": "Marcelo Monteiro Ignacio de Paula", "dia": "18/07"}, {"unidade": "EUSÉBIO E AQUIRAZ - CE", "franqueado": "Fabricia Reges", "dia": "17/07"}, {"unidade": "JOINVILLE - SC", "franqueado": "Camila Orsi Heidemann", "dia": "07/07"}, {"unidade": "PALMAS - TO", "franqueado": "Cibelle Gomes Quintas Toledo", "dia": "17/07"}, {"unidade": "SALVADOR PITUBA - BA", "franqueado": "Camylla Vilas Boas", "dia": "24/07"}, {"unidade": "SANTO ANDRÉ E CAETANO - SP", "franqueado": "Tamires Zanellato Brito", "dia": "03/07"}, {"unidade": "CHAPECÓ - SC", "franqueado": "Denilson Amaral Zimmermann", "dia": "06/08"}, {"unidade": "ARACAJU JARDINS - SE", "franqueado": "Marta Lima campos bezerra", "dia": "30/08"}, {"unidade": "PATOS - PB", "franqueado": "Jonas Fernandes da Silva", "dia": "23/08"}, {"unidade": "SÃO LUIS - MA", "franqueado": "Ricardo Marques Carvalho", "dia": "06/08"}, {"unidade": "SOUSA - PB", "franqueado": "Victor Gadelha", "dia": "01/08"}, {"unidade": "CAMPO GRANDE - MS", "franqueado": "Daniel Leme Di Raimo", "dia": "06/09"}, {"unidade": "BARUERI - SP", "franqueado": "Maraiza Silva Gomes kuwana", "dia": "19/09"}, {"unidade": "MACAPÁ - AP", "franqueado": "Mirelli Perazoli", "dia": "10/09"}, {"unidade": "MARILIA - SP", "franqueado": "Camila Nogueira de Lima Hila", "dia": "11/09"}, {"unidade": "SOUSA - PB", "franqueado": "Bruna Sybelle", "dia": "10/09"}, {"unidade": "VOLTA REDONDA - RJ", "franqueado": "Taís Moreira", "dia": "18/09"}, {"unidade": "JACAREPAGUA - RJ", "franqueado": "Tuany Sales Machado", "dia": "06/09"}, {"unidade": "CASCAVEL - PR", "franqueado": "Daniele karina ferrari de oliveira", "dia": "17/10"}, {"unidade": "BARRA DA TIJUCA - RJ", "franqueado": "Marcis Freire de Brito Fernandes", "dia": "30/10"}, {"unidade": "BARUERI - SP", "franqueado": "Alexandre kuwana da silva", "dia": "12/10"}, {"unidade": "GARANHUNS - PE", "franqueado": "Patricia Raquel Dias Arruda", "dia": "16/10"}, {"unidade": "GOIÂNIA - GO", "franqueado": "Marília Theodoro de Carvalho Di Raimo", "dia": "28/10"}, {"unidade": "TERESINA - PI", "franqueado": "Henrique Buarque Gurgel", "dia": "04/10"}, {"unidade": "NATAL - RN", "franqueado": "Auderi de Lima Filho", "dia": "07/10"}, {"unidade": "RECIFE IMBIRIBEIRA - PE", "franqueado": "Micheli Ferreira dos Santos", "dia": "23/10"}, {"unidade": "CHAPECÓ - SC", "franqueado": "Milla Fontes Dalha Valhe", "dia": "29/11"}, {"unidade": "PORTO VELHO - RO", "franqueado": "Tamires Cunha vitória dos Santos", "dia": "18/11"}, {"unidade": "CAMPO GRANDE - MS", "franqueado": "Sílvia Letícia Raupp da Costa Di Raimo", "dia": "14/11"}, {"unidade": "CURITIBA AHU - PR", "franqueado": "Bruno Brandini", "dia": "29/11"}, {"unidade": "MACAPÁ - AP", "franqueado": "Ivan Perazoli", "dia": "09/11"}, {"unidade": "RIBEIRÃO PRETO - SP", "franqueado": "Juliana Mazucato Veraguas", "dia": "28/11"}, {"unidade": "LONDRINA - PR", "franqueado": "Aline Munhoz Santana Delalibera", "dia": "28/11"}, {"unidade": "BELÉM UMARIZAL - PA", "franqueado": "Camila Cardoso Silva Soares", "dia": "07/12"}, {"unidade": "CUIABÁ - MT", "franqueado": "Rodrigo Castro", "dia": "08/12"}, {"unidade": "SÃO JOSÉ DOS PINHAIS - PR", "franqueado": "Marcos Milani Rua", "dia": "12/12"}, {"unidade": "SÃO LUIS - MA", "franqueado": "Flavia Araujo Figueiredo", "dia": "06/12"}, {"unidade": "LAURO DE FREITAS - BA", "franqueado": "Georgea de Jesus Aragão de Oliveira", "dia": "20/12"}, {"unidade": "GUARABIRA - PB", "franqueado": "Bellyzia Gama da Silva Gomes", "dia": "28/12"}, {"unidade": "SALVADOR PITUBA - BA", "franqueado": "Danilo Almeida", "dia": "21/12"}, {"unidade": "PIRACICABA - SP", "franqueado": "Danilo Chiodi", "dia": "08/03"}];

// ─── ANIVERSARIANTES ─────────────────────────────────────────
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function mesFromISO(iso){ if(!iso) return null; const p=iso.split("-"); return p.length>=2?parseInt(p[1],10):null; }
function mesFromDDMM(dm){ if(!dm) return null; const p=dm.split("/"); return p.length>=2?parseInt(p[1],10):null; }
function diaFromDDMM(dm){ if(!dm) return null; return parseInt(dm.split("/")[0],10); }
function diaFromISO(iso){ if(!iso) return null; const p=iso.split("-"); return p.length>=3?parseInt(p[2],10):null; }

function AniversariantesView({ units, dbStatus }) {
  const mesAtual = TODAY.getMonth()+1;
  const [mes, setMes] = useState(mesAtual);
  const [aba, setAba] = useState("unidades"); // unidades | franqueados

  // Aniversários de INAUGURAÇÃO das unidades
  const inaugs = useMemo(()=>units
    .filter(u=>!u.cadastroOnly || u.dataInauguracao || u.inaug)
    .map(u=>{
      const iso = u.dataInauguracao || u.inaug;
      return { nome:u.name, iso, mes:mesFromISO(iso), dia:diaFromISO(iso),
        anos: iso?Math.max(0, 2026 - parseInt(iso.split("-")[0],10)):null,
        franqueado:u.franchiseeName||u.responsavelOp||"", group:u.group, responsible:u.responsible };
    })
    .filter(x=>x.mes===mes)
    .sort((a,b)=>(a.dia||0)-(b.dia||0))
  ,[units,mes]);

  // Aniversários de NASCIMENTO dos franqueados
  const pessoas = useMemo(()=>ANIV_FRANQUEADOS
    .filter(p=>mesFromDDMM(p.dia)===mes)
    .map(p=>({...p, diaN:diaFromDDMM(p.dia)}))
    .sort((a,b)=>a.diaN-b.diaN)
  ,[mes]);

  const lista = aba==="unidades"?inaugs:pessoas;

  return (
    <div style={{padding:"14px",maxWidth:880,margin:"0 auto"}}>
      <div style={{fontSize:15,fontWeight:800,color:C.textPrimary,marginBottom:4}}>🎂 Aniversariantes</div>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:14}}>Aniversários de inauguração das unidades e de nascimento dos franqueados.</div>

      {/* Filtro de mês */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
        {MESES_PT.map((m,i)=>{
          const n=i+1; const sel=mes===n; const isAtual=n===mesAtual;
          return (
            <button key={m} onClick={()=>setMes(n)} style={{
              fontSize:10,fontWeight:sel?800:600,padding:"5px 11px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",position:"relative",
              background: sel?C.laranja:isAtual?"#fff3e6":C.card,
              color: sel?"#fff":isAtual?C.laranja:C.textMuted,
              border:`1px solid ${sel?C.laranja:isAtual?C.laranja:C.cardBorder}`,
            }}>{m.slice(0,3)}{isAtual&&!sel?" ●":""}</button>
          );
        })}
      </div>

      {/* Abas */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[["unidades","🏪 Inauguração da unidade",inaugs.length],["franqueados","🎉 Nascimento do franqueado",pessoas.length]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setAba(k)} style={{
            fontSize:11,fontWeight:700,padding:"7px 14px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
            background:aba===k?C.card:"transparent",color:aba===k?C.textPrimary:C.textMuted,
            border:`1px solid ${aba===k?C.cardBorder:"transparent"}`,
          }}>{l} <span style={{opacity:0.6}}>({c})</span></button>
        ))}
      </div>

      {mes===mesAtual&&(
        <div style={{background:"#fff3e6",border:`1px solid ${C.laranja}`,borderRadius:10,padding:"9px 13px",marginBottom:12,fontSize:12,color:"#c46c0a",fontWeight:700}}>
          🎈 Mês corrente — {lista.length} aniversariante{lista.length!==1?"s":""} em {MESES_PT[mes-1]}
        </div>
      )}

      {/* Lista */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {lista.length===0&&<div style={{textAlign:"center",padding:"30px",color:C.textMuted,fontSize:12,background:C.card,borderRadius:12,border:`1px dashed ${C.cardBorder}`}}>Nenhum aniversariante em {MESES_PT[mes-1]}.</div>}

        {aba==="unidades"&&inaugs.map((u,i)=>{
          const gc=GROUP_CFG[u.group];
          const isCurrent = mes===mesAtual;
          return (
            <div key={i} style={{background:isCurrent?"#fffaf2":C.card,border:`1px solid ${isCurrent?C.laranja+"77":C.cardBorder}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{width:42,height:42,borderRadius:10,background:gc?.bg||C.inset,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:800,color:gc?.color||C.textPrimary,lineHeight:1}}>{u.dia||"?"}</span>
                <span style={{fontSize:7,color:C.textMuted,textTransform:"uppercase"}}>{MESES_PT[mes-1].slice(0,3)}</span>
              </div>
              <div style={{flex:1,minWidth:140}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{u.nome} {isCurrent&&<span style={{fontSize:11}}>🎂</span>}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{u.franqueado||"—"} {u.responsible&&<>· carteira {u.responsible}</>}</div>
              </div>
              {u.anos!=null&&<div style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:C.inset,color:C.textPrimary}}>{u.anos} {u.anos===1?"ano":"anos"}</div>}
            </div>
          );
        })}

        {aba==="franqueados"&&pessoas.map((p,i)=>{
          const isCurrent = mes===mesAtual;
          return (
            <div key={i} style={{background:isCurrent?"#fffaf2":C.card,border:`1px solid ${isCurrent?C.laranja+"77":C.cardBorder}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:10,background:"#fbeaf0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:800,color:"#c25a82",lineHeight:1}}>{p.diaN}</span>
                <span style={{fontSize:7,color:C.textMuted,textTransform:"uppercase"}}>{MESES_PT[mes-1].slice(0,3)}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textPrimary}}>{p.franqueado} {isCurrent&&<span style={{fontSize:11}}>🎉</span>}</div>
                <div style={{fontSize:10,color:C.textMuted}}>{p.unidade}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
        } catch(e){ setUsuarios([{id:"u_iva",nome:"Ivanise",email:"",whatsapp:""},{id:"u_will",nome:"Will",email:"",whatsapp:""}]); }
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
        if(usuarios.length===0) setUsuarios([{id:"u_iva",nome:"Ivanise",email:"",whatsapp:""},{id:"u_will",nome:"Will",email:"",whatsapp:""}]);
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
          } catch(e) { /* ignore */ }
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
