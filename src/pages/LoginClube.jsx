import { useState } from "react";
import { api } from "../services/api";
import { clearSession, saveSession } from "../services/auth";
import { User, Lock, Eye, EyeOff, ChevronRight, Zap, Activity, Brain, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
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
    <div className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans">
      {/* Blobs de fundo */}
      <div className="absolute top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(162,255,1,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,89,237,0.07) 0%, transparent 70%)" }} />

      {/* Linhas de grade decorativas */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(162,255,1,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(162,255,1,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">

        {/* LADO ESQUERDO — Branding */}
        <div className="flex flex-col items-center lg:items-start space-y-10 animate-fade-up">
          <img src={logoImg} alt="ProTactic" className="w-56 h-auto brightness-110 drop-shadow-2xl" />

          <div className="space-y-5 max-w-xl text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Zap className="w-4 h-4 text-pt-primary animate-pulse-slow" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-pt-primary italic">
                Acesso do Clube
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
              Decodificando<br />
              <span className="text-pt-primary">a Vitória.</span>
            </h1>

            <p className="text-pt-text-muted text-sm leading-relaxed font-bold uppercase tracking-widest opacity-60 max-w-md">
              Geração de táticas avançadas, gestão preditiva de elenco e inteligência estatística para o futebol de elite.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <StatCard icon={<Brain className="w-4 h-4" />} value="1.2M+" label="Simulações" />
            <StatCard icon={<Activity className="w-4 h-4" />} value="85k+" label="Atletas" />
            <StatCard icon={<ShieldCheck className="w-4 h-4" />} value="99.9%" label="Precisão" />
          </div>
        </div>

        {/* LADO DIREITO — Formulário */}
        <div className="flex justify-center w-full animate-fade-up delay-200">
          <div className="w-full max-w-md relative">
            {/* Card brilhante */}
            <div className="absolute -inset-px rounded-[40px] pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(162,255,1,0.15), transparent, rgba(37,89,237,0.08))" }} />

            <div className="relative bg-pt-surface border border-white/[0.07] rounded-[40px] p-10 shadow-[0_32px_80px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden">
              {/* Glow interno */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none -mr-24 -mt-24 opacity-40"
                style={{ background: "radial-gradient(circle, rgba(162,255,1,0.12) 0%, transparent 70%)" }} />

              {/* Header do card */}
              <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-pt-primary/10 border border-pt-primary/20 mb-4">
                  <div className="w-2 h-2 rounded-full bg-pt-primary animate-pulse" />
                  <span className="text-[10px] font-black text-pt-primary uppercase tracking-widest">Login do Clube</span>
                </div>
                <p className="text-pt-text-muted text-[10px] font-black uppercase tracking-[0.25em]">
                  Técnicos & Comissão Técnica
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
                    Identificador
                  </label>
                  <div className="relative group/f">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5 z-10 transition-transform group-focus-within/f:scale-110" />
                    <input
                      id="clube-username"
                      type="text"
                      placeholder="LOGIN"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-pt-bg border border-white/[0.08] rounded-2xl py-4 pl-12 pr-5 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
                    Chave de Acesso
                  </label>
                  <div className="relative group/f">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5 z-10 transition-transform group-focus-within/f:scale-110" />
                    <input
                      id="clube-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="SENHA"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-pt-bg border border-white/[0.08] rounded-2xl py-4 pl-12 pr-14 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end pr-1">
                    <Link
                      to="/forgot-password"
                      className="text-[9px] text-pt-text-muted font-black hover:text-pt-primary transition-all uppercase tracking-widest italic"
                    >
                      Recuperar Acesso //
                    </Link>
                  </div>
                </div>

                <button
                  id="clube-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 rounded-[20px] mt-2 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl uppercase tracking-[0.2em] text-sm group"
                  style={{ boxShadow: "0 8px 32px rgba(162,255,1,0.2)" }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
                  ) : (
                    <>
                      ENTRAR
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Separador */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest">ou</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* Link para admin */}
                <Link
                  to="/admin"
                  id="ir-para-admin"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-[20px] bg-pt-bg border border-white/[0.08] text-pt-text-muted hover:text-pt-blue hover:border-pt-blue/30 transition-all font-black text-[10px] uppercase tracking-widest group"
                >
                  <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Acesso Superuser
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <div className="absolute bottom-5 w-full flex justify-center pointer-events-none">
        <span className="text-[9px] text-pt-text-muted/30 font-black uppercase tracking-[0.4em]">ProTactic © 2026</span>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-pt-surface/60 border border-white/[0.06] p-4 rounded-2xl flex flex-col items-center text-center shadow-xl hover:border-pt-primary/20 transition-all group">
      <div className="text-pt-primary/40 mb-2 group-hover:text-pt-primary transition-colors">{icon}</div>
      <span className="text-white font-black text-lg tracking-tighter italic">{value}</span>
      <span className="text-pt-text-muted font-black text-[8px] uppercase mt-1 tracking-widest opacity-60">{label}</span>
    </div>
  );
}
