import { useState, useEffect } from "react";
import { api } from "../services/api";
import { getUserId } from "../services/auth";
import { Calendar, MapPin, Trophy, Target } from "lucide-react";

export default function Partidas() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get(`/api/v1/partidas/?id_usuario=${userId}`);
        setPartidas(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Erro ao carregar partidas:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) loadPartidas();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-text-muted font-space font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">
          Mapeando Calendário...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up font-sans text-pt-text">
      <header className="mb-8">
        <h1 className="text-4xl font-sora font-extrabold uppercase tracking-tighter text-pt-white">
          Calendário <span className="text-pt-primary">Tático</span>
        </h1>
        <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mt-2">
          {partidas.length} Confrontos Registrados
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {partidas.length > 0 ? partidas.map((partida) => (
          <div key={partida.id} className="bg-pt-surface-solid border border-pt-border flex flex-col md:flex-row hover:border-pt-primary/50 transition-colors group">
            
            {/* Data e Competição */}
            <div className="p-6 md:w-64 border-b md:border-b-0 md:border-r border-pt-border bg-pt-surface-bright/20 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 font-space text-[9px] text-pt-text-muted uppercase tracking-[0.2em] mb-2">
                <Calendar className="w-3 h-3" /> Data
              </span>
              <div className="font-sora text-xl font-bold text-pt-white">
                {new Date(partida.data_hora).toLocaleDateString('pt-BR')}
              </div>
              <div className="font-geist text-sm text-pt-text-muted mb-4">
                {new Date(partida.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
              </div>
              <span className="font-space text-[9px] font-bold text-pt-bg bg-pt-primary px-2 py-1 uppercase tracking-[0.1em] self-start">
                {partida.competicao}
              </span>
            </div>

            {/* Confronto */}
            <div className="p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
               {/* Ambient Glow */}
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-pt-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-pt-primary/10 transition-colors" />

               <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                 
                 <div className="flex-1 text-center md:text-left">
                   <div className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.3em] mb-2">Adversário</div>
                   <h2 className="font-sora text-3xl font-extrabold uppercase tracking-tighter text-pt-white">
                     {partida.adversario}
                   </h2>
                 </div>

                 <div className="px-6 border-x border-pt-border/50 text-center">
                    <span className="font-sora text-2xl font-bold text-pt-text-muted">VS</span>
                 </div>

                 <div className="flex-1 text-center md:text-right">
                   <div className="flex flex-col items-center md:items-end gap-3">
                     <span className={`font-space text-[10px] font-bold px-3 py-1 uppercase tracking-[0.2em] ${
                       partida.local === 'MANDANTE' ? 'border border-pt-primary text-pt-primary bg-pt-primary/10' : 'border border-pt-text-muted text-pt-text-muted bg-pt-surface-bright'
                     }`}>
                       {partida.local === 'MANDANTE' ? 'Em Casa' : 'Fora'}
                     </span>
                     <div className="flex items-center gap-1.5 font-geist text-xs text-pt-text-muted">
                       <MapPin className="w-3 h-3" /> {partida.estadio}
                     </div>
                   </div>
                 </div>

               </div>
            </div>

            {/* Ações */}
            <div className="p-6 md:w-32 border-t md:border-t-0 md:border-l border-pt-border flex items-center justify-center bg-pt-surface-bright/10">
               <button className="flex flex-col items-center gap-2 group/btn">
                 <div className="w-10 h-10 bg-pt-surface-solid border border-pt-border flex items-center justify-center group-hover/btn:bg-pt-primary group-hover/btn:border-pt-primary transition-colors">
                   <Target className="w-4 h-4 text-pt-text-muted group-hover/btn:text-pt-bg transition-colors" />
                 </div>
                 <span className="font-space text-[8px] font-bold text-pt-text-muted uppercase tracking-[0.2em] group-hover/btn:text-pt-primary transition-colors">Ver Relatório</span>
               </button>
            </div>

          </div>
        )) : (
          <div className="p-8 text-center text-pt-text-muted font-geist text-sm border border-pt-border bg-pt-surface-solid">
            Nenhuma partida encontrada na base de dados.
          </div>
        )}
      </div>
    </div>
  );
}
