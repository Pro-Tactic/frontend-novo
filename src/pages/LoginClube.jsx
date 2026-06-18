import { useState } from "react";
import { api } from "../services/api";
import { clearSession, saveSession } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function LoginClube() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const Toast = MySwal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#0B0B0B",
    color: "#FEFEFE",
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      clearSession();
      const response = await api.post("/", { username, password });
      const { access, refresh, user_type, first_name, last_name, clube_nome } = response.data;
      saveSession({ access, refresh, user_type, first_name, last_name, clube_nome });
      Toast.fire({ icon: "success", title: "ACESSO VALIDADO. BEM-VINDO!" });
      navigate("/inicio", { replace: true });
    } catch {
      Toast.fire({ icon: "error", title: "CREDENCIAIS INVÁLIDAS." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center relative overflow-hidden font-sans">

      {/* ── Camada de fundo ── */}
      <div className="absolute inset-0 z-0">
        {/* Grade tática */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(162,255,1,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(162,255,1,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Gradiente overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-br from-pt-bg via-pt-bg to-pt-surface opacity-90" />
        {/* Blob verde topo-esquerda */}
        <div
          className="absolute top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(162,255,1,0.07) 0%, transparent 70%)" }}
        />
        {/* Blob azul baixo-direita */}
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none z-5"
          style={{ background: "radial-gradient(circle, rgba(37,89,237,0.07) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Layout Central ── */}
      <main className="relative z-40 w-full max-w-5xl mx-auto px-8 py-12 flex flex-col lg:flex-row items-center gap-16 min-h-[80vh]">

        {/* ── LADO ESQUERDO — Branding ── */}
        <div className="flex-1 hidden lg:flex flex-col justify-center gap-8 pr-16 border-r border-white/[0.05] animate-fade-up">

          {/* Nome da marca */}
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-pt-primary uppercase leading-none">
              Protactic
            </h1>
            <p className="mt-2 text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em]">
              Elite Analytics Command
            </p>
          </div>

          {/* Descrição */}
          <div className="border-l-2 border-pt-primary pl-5 space-y-3">
            <p className="text-base text-pt-text leading-relaxed font-medium">
              Protocolo de acesso seguro requerido.
            </p>
            <p className="text-sm text-pt-text-muted leading-relaxed">
              Autorize a identidade para inicializar o painel tático, a matriz de scouting e a telemetria em tempo real.
            </p>
          </div>

          {/* Criptografia */}
          <div className="flex items-center gap-2 text-pt-primary opacity-60 mt-4">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>security</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conexão Criptografada</span>
          </div>
        </div>

        {/* ── LADO DIREITO — Card de Login ── */}
        <div className="w-full max-w-md animate-fade-up delay-200">

          {/* Brilho externo */}
          <div
            className="absolute -inset-px rounded pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(162,255,1,0.1), transparent, rgba(37,89,237,0.06))" }}
          />

          <div
            className="relative bg-pt-surface border border-white/[0.07] rounded p-8 overflow-hidden"
            style={{ boxShadow: "0 0 40px rgba(162,255,1,0.08), 0 32px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Badge técnico no canto */}
            <div className="absolute top-0 left-0 bg-white/[0.04] px-3 py-1.5 border-b border-r border-white/[0.08]">
              <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em]">
                AUTH.PORTAL
              </span>
            </div>

            {/* Glow interno */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none -mr-24 -mt-24 opacity-30"
              style={{ background: "radial-gradient(circle, rgba(162,255,1,0.15) 0%, transparent 70%)" }}
            />

            {/* Título mobile */}
            <div className="mt-8 mb-8 lg:hidden">
              <h2 className="text-4xl font-black text-pt-primary uppercase tracking-tighter leading-none">
                Protactic
              </h2>
            </div>

            {/* Título desktop (só no card) */}
            <div className="mt-8 mb-8 hidden lg:block">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pt-primary/10 border border-pt-primary/20 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pt-primary animate-pulse" />
                <span className="text-[10px] font-black text-pt-primary uppercase tracking-[0.2em]">Login do Clube</span>
              </div>
              <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em]">
                Técnicos &amp; Comissão Técnica
              </p>
            </div>

            {/* ── Formulário ── */}
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">

              {/* Operation ID */}
              <div className="space-y-1.5">
                <label
                  htmlFor="operation_id"
                  className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em]"
                >
                  Operation ID
                </label>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted"
                    style={{ fontSize: "20px" }}
                  >
                    badge
                  </span>
                  <input
                    id="operation_id"
                    type="text"
                    placeholder="Enter ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-pt-bg border border-white/[0.08] text-pt-text pl-10 pr-4 py-3 focus:outline-none focus:border-pt-primary transition-all"
                    style={{ borderRadius: "0" }}
                  />
                </div>
              </div>

              {/* Access Key */}
              <div className="space-y-1.5">
                <label
                  htmlFor="access_key"
                  className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em]"
                >
                  Access Key
                </label>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted"
                    style={{ fontSize: "20px" }}
                  >
                    key
                  </span>
                  <input
                    id="access_key"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-pt-bg border border-white/[0.08] text-pt-text pl-10 pr-12 py-3 focus:outline-none focus:border-pt-primary transition-all"
                    style={{ borderRadius: "0" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-primary transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Esqueceu */}
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-black text-pt-text-muted hover:text-pt-primary transition-colors uppercase tracking-[0.1em] underline decoration-white/20 hover:decoration-pt-primary"
                >
                  Forgot Access?
                </Link>
              </div>

              {/* Botão Enter */}
              <button
                id="clube-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-pt-primary text-pt-bg font-black text-sm uppercase tracking-[0.2em] py-3 px-4 flex items-center justify-center gap-2 transition-colors hover:bg-pt-primary/90 active:scale-95 mt-2"
                style={{
                  borderRadius: "0",
                  boxShadow: "0 0 20px rgba(162,255,1,0.2)",
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter</span>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                  </>
                )}
              </button>

              {/* Separador */}
              <div className="pt-4 border-t border-white/[0.06] text-center">
                <Link
                  to="/admin"
                  id="ir-para-admin"
                  className="inline-flex items-center gap-1.5 text-[10px] font-black text-pt-text-muted hover:text-pt-primary transition-colors uppercase tracking-[0.15em]"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>explore</span>
                  Acesso Superuser
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Google Fonts — Material Symbols */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      {/* Rodapé */}
      <div className="absolute bottom-5 w-full flex justify-center pointer-events-none z-40">
        <span className="text-[9px] text-pt-text-muted/30 font-black uppercase tracking-[0.4em]">
          ProTactic © 2026
        </span>
      </div>
    </div>
  );
}