import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, extractList } from "../services/api";
import { Swords, Calendar, ChevronRight, Activity, Plus } from "lucide-react";

export default function Partidas() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get("/partidas/");
        setPartidas(extractList(response.data));
      } catch (error) {
        console.error("Erro ao carregar partidas", error);
      } finally {
        setLoading(false);
      }
    }
    loadPartidas();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-pt-white/5 border-t-pt-primary rounded-full animate-spin" />
        <p className="mt-6 text-pt-text-muted font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Calendário...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-xl shadow-pt-primary/10">
              <Swords className="text-pt-primary w-8 h-8" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Histórico de Partidas</h1>
          </div>
          <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            Gestão de eventos e protocolos de escalação.
          </p>
        </div>
        
        <Link 
          to="/registro/partidas" 
          className="group flex items-center gap-3 bg-pt-primary hover:bg-pt-primary/90 text-pt-bg px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-pt-primary/20"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Novo Confronto
        </Link>
      </header>

      <div className="grid gap-6">
        {partidas.length === 0 ? (
          <div className="text-center py-24 bg-pt-surface rounded-[40px] border border-dashed border-pt-white/10 group">
             <div className="w-16 h-16 bg-pt-bg rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-pt-white/10 group-hover:border-pt-primary/30 transition-all">
                <Activity className="text-pt-white/5 w-8 h-8 group-hover:text-pt-primary transition-colors" />
             </div>
             <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.3em] italic opacity-40">
                Nenhuma operação registrada no calendário.
             </p>
          </div>
        ) : (
          partidas.map((partida) => (
            <div 
              key={partida.id} 
              className="bg-pt-surface border border-pt-white/10 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center hover:border-pt-primary/30 transition-all shadow-2xl relative overflow-hidden group/item"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover/item:bg-pt-primary/10 transition-all duration-1000" />

              <div className="flex flex-1 items-center justify-center md:justify-start gap-8 mb-8 md:mb-0 relative z-10 w-full md:w-auto">
                <div className="flex-1 text-center md:text-right">
                  <p className="font-black text-2xl text-white tracking-tighter uppercase italic drop-shadow-lg">{partida.nome_mandante || 'TIME CASA'}</p>
                </div>
                
                <div className="flex flex-col items-center gap-2 px-8">
                  <div className="bg-pt-bg border border-pt-white/10 px-6 py-2.5 rounded-2xl text-2xl font-black text-pt-primary italic tracking-widest shadow-inner group-hover/item:border-pt-primary/40 transition-all">
                    {partida.placar_mandante} : {partida.placar_visitante}
                  </div>
                  <span className="text-[10px] font-black text-pt-text-muted/40 uppercase tracking-[0.3em] italic">SCORE</span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <p className="font-black text-2xl text-white tracking-tighter uppercase italic drop-shadow-lg">{partida.nome_visitante || 'VISITANTE'}</p>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-5 relative z-10 border-t md:border-t-0 md:border-l border-pt-white/5 pt-8 md:pt-0 md:pl-10 w-full md:w-auto">
                <div className="flex items-center gap-2 text-pt-text-muted font-black text-[10px] uppercase tracking-[0.3em] italic bg-pt-bg/50 px-4 py-1.5 rounded-full border border-pt-white/5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(partida.data_hora).toLocaleDateString()}
                </div>
                
                <Link
                  to={`/escalacao/${partida.id}`}
                  className="w-full md:w-auto bg-pt-primary/5 hover:bg-pt-primary text-pt-primary hover:text-pt-bg px-10 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.4em] transition-all border border-pt-primary/20 flex items-center justify-center gap-3 group"
                >
                  Configurar Tática
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-4 opacity-20 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em] italic leading-none">PT-CALENDAR MANAGER_V4</span>
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
      </div>
    </div>
  );
}
