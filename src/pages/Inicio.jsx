import { useState, useEffect } from "react";
import { api } from "../services/api";
import { clearSession, getUserType, getClubeNome, getFirstName, getLastName, getUserId } from "../services/auth";
import { Users, Calendar, AlertCircle, LogOut, Activity, Zap, ShieldCheck, TrendingUp, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../icon/logo-protactic.png";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Inicio() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const clubeNome = getClubeNome() || "Clube Desconhecido";
  const firstName = getFirstName() || "Técnico";
  const userType = getUserType();
  const userId = getUserId();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get(`/api/v1/dashboard/?id_usuario=${userId}`);
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleLogout = () => {
    MySwal.fire({
      title: "SAIR DA CAVERNA?",
      text: "Deseja mesmo desconectar sua sessão?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#A2FF01",
      cancelButtonColor: "#2559ED",
      confirmButtonText: "<span style='color: #0B0B0B; font-weight: 900'>SIM, SAIR</span>",
      cancelButtonText: "<span style='color: #FFF; font-weight: 900'>FICAR</span>",
      background: "#111",
      color: "#FEFEFE",
    }).then((result) => {
      if (result.isConfirmed) {
        clearSession();
        navigate("/");
      }
    });
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-pt-bg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pt-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="w-16 h-16 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-text-muted font-black text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">
          {loading ? "Processando Inteligência Tática..." : "Erro ao carregar dados..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pt-bg text-pt-text p-6 lg:p-12 relative overflow-hidden font-sans">
      {/* Grade de fundo */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(162,255,1,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(162,255,1,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(162,255,1,0.05) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10 animate-fade-up">
        {/* Topbar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
          <div className="flex items-center gap-6">
            <img src={logoImg} alt="ProTactic" className="w-16 h-auto drop-shadow-xl brightness-110" />
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                Panorama <span className="text-pt-primary">Tático</span>
              </h1>
              <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.2em] mt-1">
                Olá, {firstName} // Central de Comando
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-pt-surface border border-white/[0.05] hover:bg-pt-primary hover:text-pt-bg transition-colors group self-start md:self-auto"
          >
            <LogOut className="w-4 h-4 text-pt-text-muted group-hover:text-pt-bg transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted group-hover:text-pt-bg">Desconectar</span>
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lado Esquerdo - Perfil e Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-pt-surface border border-white/[0.05] rounded-[40px] p-8 relative overflow-hidden shadow-2xl group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-pt-primary/10 transition-colors" />
              
              <div className="flex flex-col items-center text-center space-y-5 relative z-10">
                <div className="w-28 h-28 rounded-full bg-pt-bg border border-pt-primary/20 flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 rounded-full border border-pt-primary/40 animate-ping opacity-20" />
                  <ShieldCheck className="w-12 h-12 text-pt-primary drop-shadow-[0_0_10px_rgba(162,255,1,0.5)]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{data.clube.nome}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-[9px] font-black text-pt-bg uppercase tracking-widest px-3 py-1 bg-pt-primary rounded-full shadow-[0_0_15px_rgba(162,255,1,0.3)]">{data.clube.pais}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-2xl bg-pt-bg/50 border border-white/[0.03] text-center hover:border-pt-primary/20 transition-colors">
                  <div className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest mb-1">Partidas</div>
                  <div className="text-2xl font-black text-white italic tracking-tighter">{data.estatisticas.total_jogos}</div>
                </div>
                <div className="p-4 rounded-2xl bg-pt-primary/10 border border-pt-primary/20 text-center shadow-inner">
                  <div className="text-[9px] font-black text-pt-primary uppercase tracking-widest mb-1">Vitórias</div>
                  <div className="text-2xl font-black text-pt-primary italic tracking-tighter">{data.estatisticas.vitorias}</div>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em]">Aproveitamento</span>
                  <span className="text-sm font-black text-pt-primary italic">{data.estatisticas.aproveitamento}%</span>
                </div>
                <div className="h-2 w-full bg-pt-bg rounded-full overflow-hidden border border-white/[0.02]">
                  <div className="h-full bg-pt-primary rounded-full shadow-[0_0_10px_rgba(162,255,1,0.5)]" style={{ width: `${data.estatisticas.aproveitamento}%` }} />
                </div>
              </div>
            </div>
            
            <div className="bg-pt-surface border border-white/[0.05] rounded-[32px] p-8 flex items-center justify-between group cursor-pointer hover:border-pt-primary/30 transition-all">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-pt-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <TrendingUp className="w-5 h-5 text-pt-primary" />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Desempenho</h3>
                   <p className="text-[9px] text-pt-text-muted font-bold uppercase tracking-widest">Relatório Completo</p>
                 </div>
               </div>
               <div className="w-8 h-8 rounded-full border border-white/[0.1] flex items-center justify-center group-hover:bg-pt-primary group-hover:border-pt-primary group-hover:text-pt-bg transition-colors">
                 <span className="font-black text-xs">&rarr;</span>
               </div>
            </div>
          </div>

          {/* Lado Direito - Jogo e Escalação */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-pt-surface border border-white/[0.05] rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-pt-blue/5 rounded-full blur-[80px] -mr-20 -mb-20 pointer-events-none" />
               
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-3">
                   <Calendar className="w-5 h-5 text-pt-primary" />
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Próximo Combate</h3>
                 </div>
                 <div className="px-4 py-1.5 rounded-full bg-pt-primary/10 border border-pt-primary/20 text-[9px] font-black text-pt-primary uppercase tracking-[0.2em] inline-flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-pt-primary animate-pulse" />
                   {data.proximo_jogo.competicao}
                 </div>
               </div>

               <div className="p-8 rounded-[32px] bg-pt-bg/60 border border-white/[0.03] relative z-10 hover:border-pt-primary/20 transition-all">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                     <div>
                       <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] mb-2">Adversário</p>
                       <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">
                         {data.proximo_jogo.adversario}
                       </h2>
                       <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-pt-primary uppercase tracking-widest bg-pt-primary/10 px-3 py-1 rounded-md">
                            <Activity className="w-3 h-3" /> {data.proximo_jogo.local === 'MANDANTE' ? 'EM CASA' : 'FORA'}
                          </span>
                          <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.1em]">
                            {new Date(data.proximo_jogo.data_hora).toLocaleDateString('pt-BR')} às {new Date(data.proximo_jogo.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                          </span>
                       </div>
                     </div>
                     <div className="w-full lg:w-px h-px lg:h-16 bg-white/[0.05]" />
                     <div className="lg:text-right">
                       <p className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.3em] mb-2">Local da Batalha</p>
                       <div className="flex items-center lg:justify-end gap-2 text-lg font-black text-white uppercase italic tracking-tighter">
                         {data.proximo_jogo.estadio} <Trophy className="w-4 h-4 text-pt-primary opacity-50" />
                       </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-pt-surface border border-white/[0.05] rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                 <div className="flex items-center gap-3">
                   <Users className="w-5 h-5 text-pt-primary" />
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Provável Onze</h3>
                 </div>
                 <span className="text-[9px] font-black text-pt-text-muted/60 uppercase tracking-[0.2em] italic">
                   Fonte: {data.origem_escalacao === "partida" ? "Inteligência Tática" : "Palpite"}
                 </span>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                 {data.provavel_escalacao.map((jogador) => (
                   <div key={jogador.jogador_id} className="p-4 rounded-2xl bg-pt-bg/40 border border-white/[0.03] hover:border-pt-primary/30 hover:bg-pt-primary/5 transition-all group flex flex-col items-center text-center">
                     <span className="text-xs font-black text-white uppercase tracking-widest italic group-hover:text-pt-primary transition-colors">
                       {jogador.nome}
                     </span>
                     <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] mt-1 opacity-50">
                       {jogador.posicao}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
