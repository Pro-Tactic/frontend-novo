import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Filter } from 'lucide-react';

const Elenco = () => {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchJogadores = async () => {
      try {
        const response = await api.get('/jogadores/');
        if (mounted) {
          // If the DB is empty, provide some dummy entries so the layout is visible
          const data = response.data && response.data.length > 0 ? response.data : [
            { id: 1, nome: "Jogador 1" },
            { id: 2, nome: "Jogador 2" },
            { id: 3, nome: "Jogador 3" },
            { id: 4, nome: "Jogador 4" },
            { id: 5, nome: "Jogador 5" }
          ];
          setJogadores(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setJogadores([
            { id: 1, nome: "Mock 1" },
            { id: 2, nome: "Mock 2" },
            { id: 3, nome: "Mock 3" }
          ]);
          setLoading(false);
        }
      }
    };
    fetchJogadores();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="animate-in fade-in duration-1000 max-w-[1200px] mx-auto relative">
      
      {/* 
        A grid layout to match the prototype exact structure: 
        Player cards are just a Blue Circle on top of a Blue Rectangle "PONTOS FORTES / PONTOS FRACOS".
        A top right button "FILTRAR POR CARACTERISTICA".
      */}
      
      {/* Top Right Filter Button */}
      <div className="flex justify-end mb-8 relative z-20">
         <div className="bg-blue-500 rounded-xl px-6 py-3 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:bg-blue-400 transition-colors">
            <span className="font-black text-white text-sm uppercase tracking-widest text-center flex items-center gap-2">
              FILTRAR POR CARACTERÍSTICA
            </span>
         </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {jogadores.map((jogador) => (
            <div key={jogador.id} className="flex flex-col items-center group">
               
               {/* Player Avatar (Blue Circle) */}
               <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_25px_rgba(59,130,246,0.3)] z-10 mb-[-20px] overflow-hidden group-hover:scale-105 transition-transform">
                  <span className="font-black text-white text-3xl uppercase">{jogador.nome?.slice(0, 2) || "PL"}</span>
               </div>

               {/* Stats Box (Blue Rectangle) */}
               <div className="w-full bg-blue-500 rounded-3xl pt-10 pb-6 px-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <span className="font-black text-white text-xs md:text-sm uppercase tracking-widest text-center leading-relaxed">
                    PONTOS FORTES<br/>PONTOS FRACOS
                  </span>
               </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Elenco;