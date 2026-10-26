import { useState, type FormEvent } from "react";

type AuthLoginProps = {
  /** A função real de login deve ser fornecida pelo provedor de Auth configurado. */
  signIn: (email: string, password: string) => Promise<void>;
};

/** Protótipo isolado. NÃO autoriza acesso sozinho: exige sessão validada e RLS. */
export function AuthLogin({ signIn }: AuthLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch {
      setError("Não foi possível entrar. Confira suas credenciais ou procure a administração.");
    } finally {
      setBusy(false);
      setPassword("");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f7f9fc", padding: 20 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 390, padding: 28, background: "white", borderRadius: 16, boxShadow: "0 8px 28px #1232" }}>
        <h1 style={{ marginTop: 0, color: "#234a8a" }}>clubkids Gestão 360</h1>
        <p>Acesso exclusivo da equipe da franqueadora.</p>
        <label htmlFor="ck-email">E-mail corporativo</label>
        <input id="ck-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", margin: "8px 0 18px", padding: 12 }} />
        <label htmlFor="ck-password">Senha</label>
        <input id="ck-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", margin: "8px 0 18px", padding: 12 }} />
        {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
        <button disabled={busy} type="submit" style={{ width: "100%", padding: 13, border: 0, borderRadius: 8, background: "#2456a5", color: "white" }}>{busy ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
