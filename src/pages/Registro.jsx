import { useState, useEffect } from "react";
import { clearSession, getFirstName, getUserType } from "../services/auth";
import { LogOut, ShieldCheck, Database, Plus, Search, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const firstName = getFirstName() || "Admin";
  const userType = getUserType();

  useEffect(() => {
    if (userType !== "ADMIN") {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userType, navigate]);

  const handleLogout = () => {
    MySwal.fire({
      title: "ENCERRAR SESSÃO?",
      text: "Isso removerá seus acessos de superuser até novo login.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2559ED",
      cancelButtonColor: "#7F869B",
      confirmButtonText: "<span style='color: #FEFEFE; font-weight: 900'>SIM, ENCERRAR</span>",
      cancelButtonText: "<span style='color: #FEFEFE; font-weight: 900'>MANTER ACESSO</span>",
      background: "#111",
      color: "#FEFEFE",
    }).then((result) => {
      if (result.isConfirmed) {
        clearSession();
        navigate("/admin");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pt-bg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pt-blue/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-16 h-16 border-4 border-pt-blue/20 border-t-pt-blue rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-blue font-black text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">Validando Permissões...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pt-bg text-pt-text p-6 lg:p-12 relative overflow-hidden font-sans">
      {/* Grade de fundo estilo terminal */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(37,89,237,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,89,237,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,89,237,0.06) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10 animate-fade-up">
        {/* Topbar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-pt-blue/10">
          <div className="flex items-center gap-6">
            <img src={logoImg} alt="ProTactic" className="w-12 h-auto drop-shadow-xl brightness-110 grayscale" />
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                Painel <span className="text-pt-blue">Superuser</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Terminal className="w-3 h-3 text-pt-blue" />
                <p className="text-[10px] font-black text-pt-blue uppercase tracking-[0.2em]">
                  root@{firstName.toLowerCase()} // Controle Mestre
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pt-bg border border-pt-blue/20 hover:bg-pt-blue hover:text-white transition-colors group self-start md:self-auto"
          >
            <LogOut className="w-4 h-4 text-pt-text-muted group-hover:text-white transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted group-hover:text-white">Desconectar ROOT</span>
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card de Adição */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-pt-surface border border-pt-blue/10 rounded-[40px] p-8 relative overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pt-blue/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-pt-blue/10 transition-colors" />
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-pt-blue/10 border border-pt-blue/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-pt-blue" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Novo Registro</h2>
                  <p className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em]">Entidades Globais</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-pt-bg/50 border border-pt-blue/10 hover:border-pt-blue/40 transition-all group/btn">
                  <span className="text-xs font-black text-white uppercase tracking-widest">Criar Clube</span>
                  <Plus className="w-4 h-4 text-pt-blue group-hover/btn:scale-125 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-pt-bg/50 border border-pt-blue/10 hover:border-pt-blue/40 transition-all group/btn">
                  <span className="text-xs font-black text-white uppercase tracking-widest">Criar Técnico</span>
                  <Plus className="w-4 h-4 text-pt-blue group-hover/btn:scale-125 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-pt-bg/50 border border-pt-blue/10 hover:border-pt-blue/40 transition-all group/btn">
                  <span className="text-xs font-black text-white uppercase tracking-widest">Criar Administrador</span>
                  <Plus className="w-4 h-4 text-pt-blue group-hover/btn:scale-125 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Área de Listagem Mock */}
          <div className="lg:col-span-2">
            <div className="bg-pt-surface border border-pt-blue/10 rounded-[40px] p-8 lg:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] h-full">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className="w-6 h-6 text-pt-blue" />
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bancos de Dados</h3>
                 </div>
                 
                 {/* Barra de Pesquisa */}
                 <div className="relative group/search">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pt-blue z-10" />
                   <input 
                     type="text" 
                     placeholder="QUERY..." 
                     className="w-full md:w-64 bg-pt-bg border border-pt-blue/20 rounded-full py-2.5 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-pt-blue transition-colors"
                   />
                 </div>
               </div>

               <div className="space-y-4">
                 {[1, 2, 3].map((item) => (
                   <div key={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-pt-bg/40 border border-pt-blue/5 hover:border-pt-blue/20 transition-all cursor-pointer">
                     <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-pt-blue animate-pulse-slow" />
                       <div>
                         <div className="text-sm font-black text-white uppercase italic tracking-tighter">Entidade Genérica {item}</div>
                         <div className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] mt-1">ID: #000{item} // Tipo: Indefinido</div>
                       </div>
                     </div>
                     <span className="text-[10px] font-black text-pt-blue uppercase tracking-widest bg-pt-blue/10 px-3 py-1.5 rounded-lg border border-pt-blue/20">
                       Acessar &rarr;
                     </span>
                   </div>
                 ))}
                 
                 <div className="p-8 text-center mt-4">
                   <Terminal className="w-8 h-8 text-pt-blue/20 mx-auto mb-3" />
                   <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em]">Aguardando conexão real com API de listagem.</p>
                 </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
