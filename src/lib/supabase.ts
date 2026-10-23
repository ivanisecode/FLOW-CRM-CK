// ─── SUPABASE CONFIG ─────────────────────────────────────────
export const SUPABASE_URL = "https://bqspprdmvludxeokcyjp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxc3BwcmRtdmx1ZHhlb2tjeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTkzMzgsImV4cCI6MjA5NjQzNTMzOH0.AgaMkfIgX4yB5rQ7M-Em5DG3_ONZAQwtKRQd_rz3utY";

// ─── LOGIN (Supabase Auth) ───────────────────────────────────
// A sessão fica no navegador. Todas as chamadas ao banco vão com o token
// de quem entrou; sem login, o banco não devolve nada (regras de acesso no Supabase).
export type Sessao = { access_token: string; refresh_token: string; expires_at: number; email: string };
const SESSAO_KEY = "flowcrm_sessao";

function lerSessao(): Sessao | null {
  try { return JSON.parse(localStorage.getItem(SESSAO_KEY) || "null"); } catch { return null; }
}
function gravarSessao(s: Sessao | null) {
  try { if (s) localStorage.setItem(SESSAO_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSAO_KEY); } catch { /* sem armazenamento */ }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deResposta(j: any): Sessao {
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600),
    email: j.user?.email || "",
  };
}
async function authFetch(path: string, body: unknown, token?: string, method = "POST") {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let j: any; try { j = txt ? JSON.parse(txt) : {}; } catch { j = { msg: txt }; }
  if (!res.ok) throw new Error(traduzErro(j.error_description || j.msg || j.message || j.error || txt));
  return j;
}
function traduzErro(m: string) {
  const s = String(m || "").toLowerCase();
  if (s.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (s.includes("email not confirmed")) return "Confirme o seu e-mail: abra a mensagem que o sistema enviou e toque no link.";
  if (s.includes("already registered") || s.includes("already been registered")) return "Este e-mail já tem acesso. Use Entrar ou Esqueci a senha.";
  if (s.includes("password should be")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (s.includes("rate limit")) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  return m || "Não foi possível concluir. Tente de novo.";
}

export const auth = {
  sessao: lerSessao,

  async primeiroAcesso(email: string) {
    const volta = encodeURIComponent('https://musical-lokum-f21932.netlify.app/');
    await authFetch(`otp?redirect_to=${volta}`, { email: email.trim().toLowerCase(), create_user: true });
  },

  async entrar(email: string, senha: string) {
    const j = await authFetch("token?grant_type=password", { email: email.trim(), password: senha });
    const s = deResposta(j); gravarSessao(s); return s;
  },

  // Primeiro acesso: cria a senha. Só entra quem estiver em Usuários com este e-mail.
  async criarAcesso(email: string, senha: string) {
    const volta = encodeURIComponent('https://musical-lokum-f21932.netlify.app/');
    const j = await authFetch(`signup?redirect_to=${volta}`, { email: email.trim(), password: senha });
    if (j.access_token) { const s = deResposta(j); gravarSessao(s); return s; }
    return null; // precisa confirmar o e-mail
  },

  async esqueciSenha(email: string) {
    const volta = encodeURIComponent('https://musical-lokum-f21932.netlify.app/');
    await authFetch(`recover?redirect_to=${volta}`, { email: email.trim() });
  },

  async novaSenha(senha: string) {
    const s = lerSessao(); if (!s) throw new Error("Sessão expirada. Peça o link de novo.");
    await authFetch("user", { password: senha }, s.access_token, "PUT");
  },

  // Volta do link de e-mail (confirmação ou troca de senha): #access_token=...&type=...
  lerRetornoDoEmail(): { sessao: Sessao; tipo: string } | null {
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const at = h.get("access_token"); if (!at) return null;
    let email = "";
    try { email = JSON.parse(atob(at.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || ""; } catch { /* sem e-mail */ }
    const s: Sessao = { access_token: at, refresh_token: h.get("refresh_token") || "", expires_at: Number(h.get("expires_at")) || Math.floor(Date.now() / 1000) + 3600, email };
    gravarSessao(s);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    return { sessao: s, tipo: h.get("type") || "" };
  },

  async garantir() {
    const s = lerSessao(); if (!s) return null;
    if (s.expires_at - Math.floor(Date.now() / 1000) > 60) return s;
    try {
      const j = await authFetch("token?grant_type=refresh_token", { refresh_token: s.refresh_token });
      const n = { ...deResposta(j), email: deResposta(j).email || s.email }; gravarSessao(n); return n;
    } catch { gravarSessao(null); return null; }
  },

  sair() { gravarSessao(null); },
};

function cabecalhos() {
  const s = lerSessao();
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${s?.access_token || SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
}

export const sb = {
  get headers() { return cabecalhos(); },

  async rpc(fn, body = {}) {
    await auth.garantir();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: "POST", headers: cabecalhos(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async get(table, params = "") {
    await auth.garantir();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, { headers: cabecalhos() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(table, data) {
    await auth.garantir();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: cabecalhos(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async patch(table, id, data, idField = "id") {
    await auth.garantir();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "PATCH", headers: cabecalhos(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async upsert(table, data, onConflict = "") {
    await auth.garantir();
    const url = `${SUPABASE_URL}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ""}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...cabecalhos(), "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async delete(table, id, idField = "id") {
    await auth.garantir();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "DELETE", headers: cabecalhos(),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  },
};

