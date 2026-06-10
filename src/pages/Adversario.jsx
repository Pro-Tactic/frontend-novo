import React from 'react';
import { Target, Search, FileText, ChevronDown } from 'lucide-react';

const Taticas = () => {
  const userType = localStorage.getItem("user_type") || "";
  const isAnalista = userType.toLowerCase().includes('analista');

  return (
    <div className="animate-in fade-in duration-1000 max-w-[1200px] mx-auto">
      
      {/* 
        A grid layout to match the prototype exact structure: 
        Left column for Tatica Prevista, Fase do Jogo, Formation Map.
        Right column for the main yellow box (RELATORIO or INSIGHTS).
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        
        {/* ESQUERDA: Botões e Mapa */}
        <div className="flex flex-col gap-6 items-center">
          
          {/* TATICA PREVISTA Button */}
          <div className="w-full max-w-[300px] bg-blue-500 rounded-xl px-6 py-4 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-blue-400 transition-colors">
             <span className="font-black text-white text-lg md:text-xl uppercase tracking-widest text-center">
               TÁTICA PREVISTA
             </span>
          </div>

          {/* FASE DO JOGO Button */}
          <div className="bg-blue-500 rounded-lg px-6 py-2 flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer hover:bg-blue-400 transition-colors">
             <span className="font-black text-white text-xs uppercase tracking-[0.2em]">FASE DO JOGO</span>
             <ChevronDown className="w-4 h-4 text-white" />
          </div>

          {/* Formation Map (Dots) */}
          <div className="w-full max-w-[300px] aspect-[3/4] relative mt-4">
             <div className="absolute inset-0 bg-pt-bg/40 rounded-3xl border-2 border-blue-500/30 overflow-hidden">
                {/* Field lines */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
             </div>
             
             {/* Player Dots (4-4-2 arrangement) */}
             <div className="absolute inset-0 p-4 relative z-10 flex flex-col justify-between">
                {/* Strikers */}
                <div className="flex justify-center gap-12 mt-8">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                {/* Midfielders */}
                <div className="flex justify-around px-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)] mt-4" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)] mt-4" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                {/* Defenders */}
                <div className="flex justify-around mb-8">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                {/* Goalkeeper */}
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
             </div>
          </div>
          
        </div>

        {/* DIREITA: Main Yellow Box */}
        <div className="flex flex-col">
          <div className="w-full h-full min-h-[500px] bg-yellow-400 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-50 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
               {isAnalista ? (
                 <>
                    <FileText className="w-20 h-20 text-yellow-600 mb-6 opacity-50" />
                    <h2 className="font-black text-yellow-900 text-4xl md:text-6xl uppercase tracking-tighter">
                      RELATÓRIO
                    </h2>
                 </>
               ) : (
                 <>
                    <Search className="w-20 h-20 text-yellow-600 mb-6 opacity-50" />
                    <h2 className="font-black text-yellow-900 text-4xl md:text-6xl uppercase tracking-tighter">
                      INSIGHTS
                    </h2>
                 </>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Taticas;