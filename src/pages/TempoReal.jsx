import React from 'react';
import { Activity, Users, Bot } from 'lucide-react';

const TempoReal = () => {
  const userType = localStorage.getItem("user_type") || "";
  const isComissao = !userType.toLowerCase().includes('analista');

  return (
    <div className="animate-in fade-in duration-1000 max-w-[1200px] mx-auto">
      
      {/* 
        A grid layout to match the prototype exact structure: 
        Left column for DADOS DO JOGO and Formation Map.
        Right column for DADOS DOS JOGADORES (with IA button if Comissao).
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ESQUERDA: Dados do Jogo + Mapa */}
        <div className="flex flex-col gap-8">
          
          {/* DADOS DO JOGO Box */}
          <div className="w-full h-64 bg-yellow-400 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.2)] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-50 pointer-events-none" />
             <Activity className="w-12 h-12 text-yellow-600 mb-4 opacity-50 relative z-10" />
             <span className="font-black text-yellow-900 text-3xl uppercase tracking-tighter relative z-10">
               DADOS DO JOGO
             </span>
          </div>

          {/* Formation Map (Dots) */}
          <div className="w-full aspect-square relative self-center max-w-[400px]">
             <div className="absolute inset-0 bg-pt-bg/40 rounded-3xl border-2 border-blue-500/30 overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
             </div>
             
             {/* Player Dots (4-4-2 arrangement) */}
             <div className="absolute inset-0 p-6 relative z-10 flex flex-col justify-between">
                <div className="flex justify-center gap-16 mt-8">
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="flex justify-around px-2">
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)] mt-6" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)] mt-6" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="flex justify-around mb-12">
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
             </div>
          </div>
          
        </div>

        {/* DIREITA: DADOS DOS JOGADORES Box */}
        <div className="flex flex-col h-full min-h-[600px] relative">
          <div className="w-full h-full flex-1 bg-yellow-400 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-50 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
               <Users className="w-20 h-20 text-yellow-600 mb-6 opacity-50" />
               <h2 className="font-black text-yellow-900 text-4xl md:text-5xl uppercase tracking-tighter">
                 DADOS DOS<br/>JOGADORES
               </h2>
            </div>
          </div>

          {/* Botão de IA exclusivo para Comissão Técnica */}
          {isComissao && (
            <div className="absolute bottom-6 right-6 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)] border-4 border-white cursor-pointer hover:scale-110 transition-transform">
               <span className="font-black text-white text-2xl uppercase">IA</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TempoReal;