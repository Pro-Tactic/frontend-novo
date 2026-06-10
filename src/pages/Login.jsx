import { useState } from "react";
import { api } from "../services/api";
import { fetchNavigation } from "../services/navigation";
import { clearSession, saveSession } from "../services/auth";
import { prefetchAdminLandingRoute, prefetchCoachLandingRoute } from "../services/routePrefetch";
import { User, Lock, Eye, EyeOff, ChevronRight, Zap, ShieldCheck, Activity, Brain } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0B0B0B',
    color: '#FEFEFE',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      clearSession();

      const response = await api.post("/usuarios/login", {
        username,
        password,
      });

      const { access, refresh, user_type, first_name, last_name, clube_nome } = response.data;

      saveSession({ access, refresh, user_type, first_name, last_name, clube_nome });

      if (user_type === "Admin") {
        prefetchAdminLandingRoute();
      } else {
        prefetchCoachLandingRoute();
      }

      Toast.fire({
        icon: 'success',
        title: 'ACESSO VALIDADO. BEM-VINDO!.'
      });

      const target = user_type === "Admin" ? "/registro" : "/inicio";
      navigate(target, { replace: true });

      fetchNavigation({ preferCache: false }).catch((navErr) => {
        console.error("Falha ao pré-carregar navegação:", navErr);
      });

    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: 'error',
        title: 'CREDENCIAIS INVÁLIDAS OU ERRO DE PROTOCOLO.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-pt-bg text-pt-text flex items-center justify-center p-6 lg:p-12 relative overflow-hidden font-sans selection:bg-pt-primary selection:text-pt-bg">
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-pt-primary/5 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pt-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center z-10 animate-in fade-in zoom-in-95 duration-700 lg:scale-[0.8] origin-center">

        <div className="flex flex-col items-center lg:items-start space-y-12">
          <div className="flex flex-col items-center lg:items-start origin-left">
            <img src={logoImg} alt="ProTactic" className="w-64 h-auto brightness-110 drop-shadow-2xl mb-2" />
          </div>

          <div className="space-y-6 max-w-xl text-center lg:text-left pt-6">
            <div className="flex items-center justify-center lg:justify-start gap-3 opacity-80">
              <Zap className="w-5 h-5 text-pt-primary animate-pulse" />
              <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-pt-primary italic leading-none">
                Comando de Inteligência Artificial
              </h2>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
              Decodificando <br />
              <span className="text-pt-primary">a Vitória.</span>
            </h1>

            <p className="text-pt-text-muted text-sm md:text-base leading-relaxed font-bold uppercase tracking-widest opacity-60 max-w-md">
              Geração de táticas avançadas, gestão preditiva de elenco e inteligência estatística para o futebol de elite.
            </p>

            <div className="pt-4">
              <button
                onClick={() => navigate("/sobre")}
                type="button"
                className="group flex items-center gap-3 bg-pt-surface border border-pt-white/10 px-10 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest hover:border-pt-primary/40 hover:bg-pt-primary hover:text-pt-bg transition-all shadow-2xl"
              >
                Explorar Ecossistema
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-xl pt-16 hidden md:grid">
            <StatCard icon={<Brain className="w-4 h-4" />} value="1.2M+" label="SIMULAÇÕES" />
            <StatCard icon={<Activity className="w-4 h-4" />} value="85k+" label="ATLETAS" />
            <StatCard icon={<ShieldCheck className="w-4 h-4" />} value="99.9%" label="PRECISÃO" />
          </div>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full max-w-lg bg-pt-surface border border-pt-white/10 rounded-[44px] p-12 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />

            <div className="mb-14 text-center">
              <p className="text-pt-text-muted text-[10px] mt-2 font-black uppercase tracking-[0.3em] italic">
                Acesse a plataforma
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-2">
                  Identificador de Operação
                </label>
                <div className="relative group/field">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5 z-10 group-focus-within/field:scale-110 transition-transform" />
                  <input
                    type="text"
                    placeholder="LOGIN"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-pt-bg border border-pt-white/10 rounded-[22px] py-5 pl-14 pr-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-2">
                  Chave de Acesso
                </label>
                <div className="relative group/field">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5 z-10 group-focus-within/field:scale-110 transition-transform" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="SENHA"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-pt-bg border border-pt-white/10 rounded-[22px] py-5 pl-14 pr-16 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-primary transition-colors z-10 p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex justify-end pr-2">
                  <Link
                    to="/forgot-password"
                    className="text-[9px] text-pt-text-muted font-black hover:text-pt-primary transition-all uppercase tracking-widest italic hover:translate-x-1"
                  >
                    Recuperar Acesso //
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-6 rounded-[24px] mt-6 flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-pt-primary/20 uppercase tracking-[0.2em] text-sm group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
                ) : (
                  <>
                    FAZER LOGIN
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <div className="absolute bottom-6 w-full flex items-center justify-center gap-6 text-[9px] text-pt-text-muted/40 font-black uppercase tracking-[0.4em] pointer-events-none whitespace-nowrap hidden lg:flex">
        <span>ProTactic © 2026</span>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-pt-surface/40 backdrop-blur-sm border border-pt-white/5 p-5 rounded-[24px] flex flex-col items-center justify-center text-center shadow-2xl hover:border-pt-primary/30 transition-all group">
      <div className="text-pt-primary/40 mb-3 group-hover:text-pt-primary transition-colors">{icon}</div>
      <span className="text-white font-black text-xl tracking-tighter leading-none italic">{value}</span>
      <span className="text-pt-text-muted font-black text-[8px] uppercase mt-2 tracking-widest opacity-60 leading-none">{label}</span>
    </div>
  );
}