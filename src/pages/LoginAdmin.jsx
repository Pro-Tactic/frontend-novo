import { useState } from "react";
import { api } from "../services/api";
import { clearSession, saveSession } from "../services/auth";
import { Terminal, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function LoginAdmin() {
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

      if (user_type !== "ADMIN") {
        Toast.fire({ icon: "error", title: "ACESSO NEGADO. Não é superuser." });
        clearSession();
        return;
      }

      saveSession({ access, refresh, user_type, first_name, last_name, clube_nome });
      Toast.fire({ icon: "success", title: "ACESSO TOTAL CONCEDIDO." });
      navigate("/registro", { replace: true });
    } catch {
      Toast.fire({ icon: "error", title: "CREDENCIAIS INVÁLIDAS." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Grade de fundo azul — tema admin */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(37,89,237,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,89,237,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

      {/* Blobs azuis */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,89,237,0.08) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,89,237,0.06) 0%, transparent 70%)" }} />

      <div className="w-full max-w-md z-10 animate-fade-up">
        {/* Voltar */}
        <Link
          to="/"
          id="voltar-login-clube"
          className="inline-flex items-center gap-2 mb-8 text-pt-text-muted hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao login do clube
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
          <img src={logoImg} alt="ProTactic" className="w-10 h-auto brightness-110" />
          <div>
            <h1 className="text-white font-black text-xl uppercase tracking-tighter italic">ProTactic</h1>
            <span className="text-[9px] text-pt-blue font-black uppercase tracking-widest">Painel Superuser</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="relative">
          {/* Borda gradiente azul */}
          <div className="absolute -inset-px rounded-[36px] pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(37,89,237,0.25), transparent, rgba(37,89,237,0.1))" }} />

          <div className="relative bg-pt-surface border border-pt-blue/10 rounded-[36px] p-10 shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* Glow azul interno */}
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none -ml-24 -mt-24 opacity-30"
              style={{ background: "radial-gradient(circle, rgba(37,89,237,0.2) 0%, transparent 70%)" }} />

            {/* Header */}
            <div className="mb-10 flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-[24px] bg-pt-blue/10 border border-pt-blue/20 flex items-center justify-center mb-4 shadow-xl"
                style={{ boxShadow: "0 0 32px rgba(37,89,237,0.15)" }}>
                <ShieldCheck className="w-8 h-8 text-pt-blue" />
              </div>
              <h2 className="text-white font-black text-2xl uppercase italic tracking-tighter">Acesso Restrito</h2>
              <p className="text-pt-text-muted text-[10px] font-black uppercase tracking-[0.25em] mt-2">
                Somente superusuários autorizados
              </p>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-3 bg-pt-blue/5 border border-pt-blue/15 rounded-2xl p-4 mb-8 relative z-10">
              <AlertTriangle className="w-4 h-4 text-pt-blue flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-wider leading-relaxed">
                Esta área concede controle total da plataforma. Acesso monitorado e registrado.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
                  Usuário Admin
                </label>
                <div className="relative group/f">
                  <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-blue h-5 w-5 z-10 transition-transform group-focus-within/f:scale-110" />
                  <input
                    id="admin-username"
                    type="text"
                    placeholder="SUPERUSER"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-pt-bg border border-pt-blue/10 rounded-2xl py-4 pl-12 pr-5 text-pt-text focus:outline-none focus:border-pt-blue/50 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
                  Senha de Acesso
                </label>
                <div className="relative group/f">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-blue h-5 w-5 z-10 transition-transform group-focus-within/f:scale-110" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="SENHA"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-pt-bg border border-pt-blue/10 rounded-2xl py-4 pl-12 pr-14 text-pt-text focus:outline-none focus:border-pt-blue/50 transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-blue transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="admin-submit"
                type="submit"
                disabled={loading}
                className="w-full font-black py-5 rounded-[20px] mt-4 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] text-sm group text-white"
                style={{
                  background: "linear-gradient(135deg, #2559ED, #1a3fb5)",
                  boxShadow: "0 8px 32px rgba(37,89,237,0.25)"
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    AUTENTICAR
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Rodapé do card */}
        <p className="text-center text-[9px] text-pt-text-muted/30 font-black uppercase tracking-widest mt-6">
          ProTactic © 2026 — Acesso restrito
        </p>
      </div>
    </div>
  );
}
