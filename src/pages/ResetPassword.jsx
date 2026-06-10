import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Lock, Eye, EyeOff, ChevronRight, Check, ShieldCheck, Zap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get("uid");
  const token = queryParams.get("token");

  const swalConfig = {
    background: '#0B0B0B',
    color: '#FEFEFE',
    confirmButtonColor: '#A2FF01',
    confirmButtonText: 'ENTENDIDO'
  };

  useEffect(() => {
    if (!uid || !token) {
      MySwal.fire({
        title: 'ACESSO INVÁLIDO',
        text: 'O protocolo de recuperação está incompleto ou expirado.',
        icon: 'error',
        ...swalConfig
      }).then(() => {
        navigate("/");
      });
    }
  }, [uid, token, navigate]);

  const Toast = MySwal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#0B0B0B',
    color: '#FEFEFE',
  });

  async function handleResetPassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Toast.fire({
        icon: 'error',
        title: 'SENHAS DIVERGENTES.'
      });
      return;
    }

    if (newPassword.length < 8) {
        Toast.fire({
          icon: 'warning',
          title: 'MÍNIMO DE 8 CARACTERES EXIGIDO.'
        });
        return;
      }

    setLoading(true);

    try {
      await api.post("/password-reset-confirm/", {
        uid,
        token,
        new_password: newPassword
      });

      MySwal.fire({
        title: 'SENHA ATUALIZADA',
        text: 'Seu novo código de acesso foi validado pelo sistema.',
        icon: 'success',
        ...swalConfig
      }).then(() => {
        navigate("/");
      });

    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Protocolo expirado.';
      Toast.fire({
        icon: 'error',
        title: detail
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
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Nova Credencial</h2>
            <p className="text-pt-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
              Definição de novo código de acesso criptográfico.
            </p>
          </div>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Nova Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary group-focus-within:scale-110 transition-transform">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="MÍNIMO 8 CARACTERES"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-5 pl-14 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Confirmar Operação</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary group-focus-within:scale-110 transition-transform">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="REPITA A SENHA"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-5 pl-14 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 rounded-[24px] flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Validar Nova Senha
                <Check className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-pt-white/5 flex items-center justify-between opacity-30">
           <ShieldCheck className="w-4 h-4 text-pt-primary" />
           <span className="text-[8px] font-black uppercase tracking-[0.3em] font-mono italic">Criptografia: Ativada</span>
        </div>
      </main>
    </div>
  );
}
