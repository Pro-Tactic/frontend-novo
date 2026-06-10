import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Shield, Activity, X, Trophy, Footprints, Star, User, Target } from "lucide-react";

export default function PlayerStatsModal({ player, onClose }) {
  const [stats, setStats] = useState({ gols: 0, assistencias: 0, media: 0, jogos: 0 });
  const [loading, setLoading] = useState(true);

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;
    const nascimento = new Date(dataNascimento);
    if (Number.isNaN(nascimento.getTime())) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade -= 1;
    }
    return idade;
  }

  useEffect(() => {
    async function fetchStats() {
      if (!player?.id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/desempenhos/?jogador=${player.id}`);
        const data = response.data;

        const totalJogos = data.length;
        const totalGols = data.reduce((acc, item) => acc + (item.gols || 0), 0);
        const totalAssistencias = data.reduce((acc, item) => acc + (item.assistencias || 0), 0);
        
        const somaNotas = data.reduce((acc, item) => acc + Number(item.nota || 0), 0);
        const mediaNotas = totalJogos > 0 ? (somaNotas / totalJogos).toFixed(1) : "0.0";

        setStats({
          gols: totalGols,
          assistencias: totalAssistencias,
          media: mediaNotas,
          jogos: totalJogos
        });
      } catch (err) {
        console.error("Erro ao calcular stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [player]);

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pt-bg/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-pt-surface border border-pt-white/10 w-full max-w-2xl rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-300 text-pt-text">
        
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-pt-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-pt-bg hover:bg-pt-primary hover:text-pt-bg rounded-2xl text-pt-text-muted transition-all z-20 group shadow-lg"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-[35%] bg-pt-bg relative min-h-[300px] border-r border-pt-white/5">
            {player.foto ? (
              <img
                src={player.foto}
                alt={player.nome}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pt-white/5 bg-gradient-to-b from-pt-surface to-pt-bg">
                <User className="w-24 h-24" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pt-bg via-pt-bg/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 z-10">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pt-primary bg-pt-primary/10 px-3 py-1 rounded-full border border-pt-primary/20 backdrop-blur-sm">
                 {player.posicao}
               </span>
            </div>
          </div>

          <div className="w-full md:w-[65%] p-8 md:p-10 relative">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-2 uppercase italic">{player.nome}</h2>
              <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em]">
                {calcularIdade(player.data_nascimento) !== null 
                  ? `${calcularIdade(player.data_nascimento)} ANOS • ATLETA DO ${player.nome_clube || "PROTACTIC"}` 
                  : `ATLETA DO ${player.nome_clube || "PROTACTIC"}`}
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-pt-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-black text-pt-text-muted uppercase tracking-widest animate-pulse">Cruzando Performance...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5">
                <StatCard icon={Shield} label="Partidas" value={stats.jogos} />
                <StatCard icon={Target} label="Gols" value={stats.gols} highlight />
                <StatCard icon={Footprints} label="Assistências" value={stats.assistencias} />
                
                <div className="col-span-1 bg-pt-primary p-5 rounded-3xl shadow-[0_10px_20px_rgba(162,255,1,0.15)] flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-pt-bg text-[10px] uppercase font-black tracking-widest">
                    <Star className="w-3.5 h-3.5 fill-pt-bg" /> Nota Média
                  </div>
                  <div className="text-3xl font-black text-pt-bg leading-none mt-2">{stats.media}</div>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-pt-white/5">
              <div className="flex items-center gap-3 text-[9px] font-black text-pt-text-muted uppercase tracking-widest">
                <Activity className="w-3 h-3 text-pt-primary" /> Histórico de performance baseado em dados de telemetria tática.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`p-5 rounded-3xl border transition-all ${
      highlight 
        ? "bg-pt-surface border-pt-primary/30 shadow-[0_5px_15px_rgba(162,255,1,0.05)]" 
        : "bg-pt-bg/40 border-pt-white/10"
    }`}>
      <div className={`flex items-center gap-2 mb-2 ${highlight ? 'text-pt-primary' : 'text-pt-text-muted'}`}>
        <Icon className="w-3.5 h-3.5" /> 
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-white leading-none">{value ?? 0}</div>
    </div>
  );
}