import { useState } from "react";
import { api } from "../services/api";
import { ChevronRight, ArrowLeft, Mail, Zap, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const swalConfig = {
    background: '#0B0B0B',
    color: '#FEFEFE',
    confirmButtonColor: '#A2FF01',
    confirmButtonText: 'ENTENDIDO'
  };

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

  async function handleRequestReset(e) {
    e.preventDefault();
    if (!email) {
      Toast.fire({
        icon: 'warning',
        title: 'INSIRA SEU E-MAIL OPERACIONAL.'
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/password-reset/", { email });

      MySwal.fire({
        title: 'PROTOCOLO INICIADO',
        text: 'Se o e-mail estiver na base de dados, as instruções de recuperação foram enviadas.',
        icon: 'success',
        ...swalConfig
      }).then(() => {
        navigate("/");
      });

    } catch (err) {
      console.error(err);
      Toast.fire({
        icon: 'error',
        title: 'FALHA NA SOLICITAÇÃO.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pt-bg text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pt-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pt-primary/5 rounded-full blur-[100px]" />

      <main className="w-full max-w-lg bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 md:p-14 shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-12">
          <img src={logoImg} alt="ProTactic" className="w-56 h-auto mb-10 brightness-110 drop-shadow-2xl" />
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Recuperar Acesso</h2>
            <p className="text-pt-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
              Sincronização de credenciais de elite.
            </p>
          </div>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
              E-mail de Operação
            </label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary group-focus-within:scale-110 transition-transform">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="SEU_EMAIL@DOMINIO.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-5 pl-14 pr-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 rounded-[24px] flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Restaurar Credenciais
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full group py-4 flex items-center justify-center gap-3 transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-pt-text-muted group-hover:text-pt-primary transition-colors" />
              <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest group-hover:text-white transition-colors">Voltar para Central de Comando</span>
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-pt-white/5 flex items-center justify-between opacity-30">
           <ShieldCheck className="w-4 h-4 text-pt-primary" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] font-mono italic">Nó de Segurança: Ativo</span>
        </div>
      </main>
    </div>
  );
}
