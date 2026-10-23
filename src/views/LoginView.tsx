import { useState } from "react";
import { CKLogo, CKWordmark } from "../components/TopBar";
import { C } from "../lib/constants";
import { auth, type Sessao } from "../lib/supabase";
import { btnSt, inputSt, labelSt } from "../lib/styles";

type Modo = "entrar" | "criar" | "esqueci" | "nova";

export function LoginView({ onEntrou, modoInicial = "entrar" }: { onEntrou: (s: Sessao) => void; modoInicial?: Modo }) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setAviso("");
    if (modo !== "nova" && !email.includes("@")) { setErro("Digite o seu e-mail."); return; }
    if (modo === "nova" && senha !== senha2) { setErro("As duas senhas não são iguais."); return; }
    if ((modo === "nova" || modo === "entrar") && senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    setOcupado(true);
    try {
      if (modo === "entrar") onEntrou(await auth.entrar(email, senha));
      else if (modo === "criar") {
        await auth.primeiroAcesso(email);
        setAviso("Abra o link enviado ao seu e-mail para confirmar o endereço e definir sua senha. A liberação depende do cadastro da unidade ou da aprovação da Ivanise."); setModo("entrar"); setSenha(""); setSenha2("");
      } else if (modo === "esqueci") {
        await auth.esqueciSenha(email);
        setAviso("Se este e-mail tiver acesso, chega uma mensagem com o link para criar uma senha nova.");
      } else if (modo === "nova") {
        await auth.novaSenha(senha);
        const s = auth.sessao(); if (s) onEntrou(s);
      }
    } catch (err) { setErro((err as Error).message); }
    finally { setOcupado(false); }
  }

  const titulo = { entrar: "Entrar", criar: "Primeiro acesso: criar senha", esqueci: "Esqueci a senha", nova: "Criar senha nova" }[modo];
  const campo = { ...(inputSt as React.CSSProperties), fontSize: 15, padding: "11px 12px", marginBottom: 12 };

  return (
    <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
      <form onSubmit={enviar} style={{ width: "100%", maxWidth: 380, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24, boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <CKLogo size={44} /><CKWordmark size={18} />
          <div style={{ fontSize: 12, color: C.textMuted }}>Flow CRM · gestão e unidades</div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: C.textPrimary }}>{titulo}</div>

        {modo !== "nova" && (<>
          <label style={labelSt as React.CSSProperties}>E-mail</label>
          <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={campo} />
        </>)}
        {(modo === "entrar" || modo === "nova") && (<>
          <label style={labelSt as React.CSSProperties}>{modo === "entrar" ? "Senha" : "Senha (mínimo 6 caracteres)"}</label>
          <input type="password" autoComplete={modo === "entrar" ? "current-password" : "new-password"} value={senha} onChange={e => setSenha(e.target.value)} style={campo} />
        </>)}
        {modo === "nova" && (<>
          <label style={labelSt as React.CSSProperties}>Repita a senha</label>
          <input type="password" autoComplete="new-password" value={senha2} onChange={e => setSenha2(e.target.value)} style={campo} />
        </>)}

        {erro && <div style={{ fontSize: 13, color: C.red, background: C.redBg, borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>{erro}</div>}
        {aviso && <div style={{ fontSize: 13, color: "#1f6b3a", background: "#e8f5ee", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>{aviso}</div>}

        <button type="submit" disabled={ocupado} style={{ ...(btnSt(C.laranja) as React.CSSProperties), width: "100%", padding: "12px 16px", fontSize: 15, opacity: ocupado ? 0.6 : 1 }}>
          {ocupado ? "Aguarde…" : modo === "entrar" ? "Entrar" : modo === "criar" ? "Receber link de primeiro acesso" : modo === "esqueci" ? "Enviar link" : "Salvar senha"}
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, fontSize: 13 }}>
          {modo !== "entrar" && <button type="button" onClick={() => { setModo("entrar"); setErro(""); }} style={linkSt}>Já tenho senha: entrar</button>}
          {modo !== "criar" && modo !== "nova" && <button type="button" onClick={() => { setModo("criar"); setErro(""); setAviso(""); }} style={linkSt}>Primeiro acesso: criar minha senha</button>}
          {modo === "entrar" && <button type="button" onClick={() => { setModo("esqueci"); setErro(""); setAviso(""); }} style={linkSt}>Esqueci a senha</button>}
        </div>
        <p style={{ fontSize: 11, color: C.textMuted, marginTop: 16, marginBottom: 0 }}>Franqueadas: usem sempre o e-mail cadastrado da unidade. Cada unidade acessa somente sua área. Outros contatos precisam da autorização da Ivanise.</p>
      </form>
    </div>
  );
}

const linkSt: React.CSSProperties = { background: "none", border: "none", color: C.azul, cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit", fontSize: 13 };

export function SemPermissao({ email, onSair }: { email: string; onSair: () => void }) {
  return (
    <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ maxWidth: 380, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
        <CKLogo size={40} />
        <p style={{ fontSize: 15, fontWeight: 700 }}>Não foi possível verificar seu acesso</p>
        <p style={{ fontSize: 13, color: C.textMuted }}>A verificação de {email} falhou. Saia e tente entrar novamente. Se persistir, avise a Ivanise.</p>
        <button onClick={onSair} style={btnSt(C.laranja) as React.CSSProperties}>Sair</button>
      </div>
    </div>
  );
}

