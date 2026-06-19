import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function JogadorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jogador, setJogador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const response = await api.get(`/api/v1/jogadores/${id}/perfil`);
        setJogador(response.data);
      } catch (error) {
        console.error("Erro ao buscar perfil do jogador", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#101508]">
        <div className="w-16 h-16 border-4 border-[#9ffb00]/20 border-t-[#9ffb00] rounded-full animate-spin z-10" />
        <p className="mt-6 text-[#c0caad] font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse z-10" style={{fontFamily: 'Space Grotesk'}}>
          Carregando Dados do Perfil...
        </p>
      </div>
    );
  }

  if (!jogador) {
    return <div className="text-white">Jogador não encontrado.</div>;
  }

  const { estatisticas } = jogador;
  const jogos = estatisticas?.jogos || 1; // avoid division by zero
  
  // Calculate age
  const age = jogador.data_nascimento ? 
    Math.floor((new Date() - new Date(jogador.data_nascimento)) / 31557600000) : '--';

  // Normalize stats to 0-100 scale for Radar based on per-game average.
  // We use estimated maximums per game to cap them at 100.
  const norm = (val, max) => Math.min(100, Math.max(0, ((val || 0) / jogos) / max * 100));

  const stats = {
    PASSING: norm(estatisticas?.passes_certos, 50), // 50 passes/game
    ATTACKING: norm((estatisticas?.xG || 0) + (estatisticas?.xA || 0), 1.0), // 1.0 G+A/game
    DEFENDING: norm((estatisticas?.total_cortes || 0) + (estatisticas?.desarmes_totais || 0), 6), // 6 def actions/game
    DUELS: norm(estatisticas?.duelos_vencidos, 8), // 8 duels/game
    CREATION: norm(estatisticas?.grande_chance_criada, 1.0), // 1 big chance/game
    SHOOTING: norm(estatisticas?.total_chutes, 4), // 4 shots/game
  };

  // SVG Radar calculations
  const center = 100;
  const radius = 80;
  const numPoints = 6;
  const angleStep = (Math.PI * 2) / numPoints;

  const getPoint = (value, i) => {
    // value is 0-100
    const r = (value / 100) * radius;
    // -Math.PI / 2 to start from top
    const angle = i * angleStep - Math.PI / 2;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  };

  const points = [
    stats.ATTACKING,
    stats.SHOOTING,
    stats.PASSING,
    stats.CREATION,
    stats.DEFENDING,
    stats.DUELS
  ].map((val, i) => getPoint(val, i)).join(" ");

  return (
    <div className="bg-[#101508] text-[#dfe5cf] min-h-screen overflow-x-hidden relative" style={{fontFamily: 'Geist, sans-serif'}}>
      
      {/* Glow Blobs */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" style={{background: 'radial-gradient(circle at center, rgba(2, 73, 223, 0.15) 0%, rgba(16, 21, 8, 0) 70%)'}}></div>
      <div className="fixed bottom-0 right-0 w-[1000px] h-[1000px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 z-0" style={{background: 'radial-gradient(circle at center, rgba(2, 73, 223, 0.15) 0%, rgba(16, 21, 8, 0) 70%)'}}></div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen relative z-10">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full h-16 px-6 border-b border-[#414a34] bg-[#101508]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div className="font-black text-[#ffffff] tracking-tighter hidden lg:block uppercase" style={{fontFamily: 'Sora', fontSize: '24px'}}>
              PRO-TACTIC // PERFIL_JOGADOR
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.close()} className="text-[#c0caad] hover:text-[#9ffb00] transition-opacity uppercase tracking-widest text-[10px] font-bold border border-[#c0caad]/30 px-3 py-1 rounded hover:border-[#9ffb00]">
              FECHAR ABA
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-end border-b border-[#414a34]/50 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[#c0caad] tracking-widest uppercase mb-2 text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>
                <span>VISÃO_DO_ELENCO</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-[#9ffb00]">PERFIL_{jogador.id}</span>
              </div>
              <h2 className="text-[#ffffff] tracking-tighter uppercase font-bold" style={{fontFamily: 'Sora', fontSize: '32px'}}>
                {jogador.nome_completo || jogador.apelido}
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9ffb00] animate-pulse"></span>
                <span className="text-[#9ffb00] tracking-widest text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>RASTREAMENTO_ATIVO</span>
              </div>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Player Core Identity Card */}
            <div className="rounded-[0.25rem] flex flex-col col-span-1 lg:col-span-4 overflow-hidden relative group" style={{background: 'rgba(28, 34, 20, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.07)'}}>
              <div className="h-64 relative bg-[#0a1005] border-b border-[#414a34]/30 flex items-end justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                {jogador.foto_url && (
                  <img src={jogador.foto_url} alt="Foto" className="h-full w-auto object-cover relative z-10 mix-blend-screen opacity-90 group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="text-[#9ffb00] drop-shadow-[0_0_15px_rgba(162,255,1,0.5)] font-extrabold" style={{fontFamily: 'Sora', fontSize: '64px', lineHeight: '1.1'}}>
                    {jogador.numero_camisa_clube || '--'}
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[#c0caad] tracking-widest mb-1 text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>POS</div>
                    <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{jogador.posicao_principal || '--'}</div>
                  </div>
                  <div>
                    <div className="text-[#c0caad] tracking-widest mb-1 text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>IDADE</div>
                    <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{age}</div>
                  </div>
                  <div>
                    <div className="text-[#c0caad] tracking-widest mb-1 text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>ALTURA</div>
                    <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{jogador.altura_cm || '--'} <span className="text-[#c0caad] text-[16px] font-normal" style={{fontFamily: 'Geist'}}>cm</span></div>
                  </div>
                  <div>
                    <div className="text-[#c0caad] tracking-widest mb-1 text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>PESO</div>
                    <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{jogador.peso_kg || '--'} <span className="text-[#c0caad] text-[16px] font-normal" style={{fontFamily: 'Geist'}}>kg</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Radar Card */}
            <div className="rounded-[0.25rem] p-6 flex flex-col col-span-1 lg:col-span-4 relative group transition-all duration-300 hover:shadow-[0_0_20px_rgba(162,255,1,0.15)] hover:border-[#9ffb00]" style={{background: 'rgba(28, 34, 20, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.07)'}}>
              <div className="flex justify-between items-start mb-6">
                <div className="text-[#ffffff] tracking-widest text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>RADAR_DE_DESEMPENHO</div>
                <span className="material-symbols-outlined text-[#c0caad]">radar</span>
              </div>
              <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                {/* Changed viewBox from "0 0 200 200" to "-30 -30 260 260" to avoid cutting text */}
                <svg className="w-full h-full max-w-[280px] drop-shadow-[0_0_15px_rgba(162,255,1,0.1)]" viewBox="-30 -30 260 260">
                  <g fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                    <polygon points="100,20 169.2,60 169.2,140 100,180 30.8,140 30.8,60"></polygon>
                    <polygon points="100,40 152,70 152,130 100,160 48,130 48,70"></polygon>
                    <polygon points="100,60 134.6,80 134.6,120 100,140 65.4,120 65.4,80"></polygon>
                    <polygon points="100,80 117.3,90 117.3,110 100,120 82.7,110 82.7,90"></polygon>
                    <line x1="100" y1="100" x2="100" y2="20"></line>
                    <line x1="100" y1="100" x2="169.2" y2="60"></line>
                    <line x1="100" y1="100" x2="169.2" y2="140"></line>
                    <line x1="100" y1="100" x2="100" y2="180"></line>
                    <line x1="100" y1="100" x2="30.8" y2="140"></line>
                    <line x1="100" y1="100" x2="30.8" y2="60"></line>
                  </g>
                  <polygon points={points} fill="rgba(162, 255, 1, 0.2)" stroke="#9ffb00" strokeWidth="2"></polygon>
                  
                  {/* Adjusted text coordinates to perfectly fit the extended viewBox */}
                  <text x="100" y="10" fill="#dfe5cf" fontFamily="Space Grotesk" fontSize="10" letterSpacing="1" textAnchor="middle">ATAQUE</text>
                  <text x="175" y="65" fill="#dfe5cf" fontFamily="Space Grotesk" fontSize="10" letterSpacing="1" textAnchor="start">CHUTE</text>
                  <text x="175" y="145" fill="#dfe5cf" fontFamily="Space Grotesk" fontSize="10" letterSpacing="1" textAnchor="start">PASSE</text>
                  <text x="100" y="200" fill="#dfe5cf" fontFamily="Space Grotesk" fontSize="10" letterSpacing="1" textAnchor="middle">CRIAÇÃO</text>
                  <text x="25" y="145" fill="#dfe5cf" fontFamily="Space Grotesk" fontSize="10" letterSpacing="1" textAnchor="end">DEFESA</text>
                  <text x="25" y="65" fill="#dfe5cf" fontFamily="Space Grotesk" fontSize="10" letterSpacing="1" textAnchor="end">DUELOS</text>
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2 bg-[#1c2214]/50 border border-[#414a34]/30">
                  <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{Math.round(stats.PASSING)}</div>
                  <div className="text-[#c0caad] text-[10px] font-bold tracking-widest" style={{fontFamily: 'Space Grotesk'}}>PASSE</div>
                </div>
                <div className="p-2 bg-[#1c2214]/50 border border-[#414a34]/30">
                  <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{Math.round(stats.ATTACKING)}</div>
                  <div className="text-[#c0caad] text-[10px] font-bold tracking-widest" style={{fontFamily: 'Space Grotesk'}}>ATAQUE</div>
                </div>
                <div className="p-2 bg-[#1c2214]/50 border border-[#414a34]/30">
                  <div className="text-[#ffffff] font-semibold" style={{fontFamily: 'Sora', fontSize: '24px'}}>{Math.round(stats.DEFENDING)}</div>
                  <div className="text-[#c0caad] text-[10px] font-bold tracking-widest" style={{fontFamily: 'Space Grotesk'}}>DEFESA</div>
                </div>
              </div>
            </div>

            {/* Pitch Heatmap - Now used for Aggregated Stats Display */}
            <div className="rounded-[0.25rem] p-6 flex flex-col col-span-1 lg:col-span-4 relative overflow-hidden" style={{background: 'rgba(28, 34, 20, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.07)'}}>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="text-[#ffffff] tracking-widest text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>MÉTRICAS_DO_BANCO_DE_DADOS</div>
              </div>
              <div className="flex-1 flex flex-col gap-4 relative z-10">
                <div className="bg-[#181d10] p-4 border border-[#414a34]/50 flex justify-between items-center">
                  <span className="text-[#c0caad] tracking-widest text-[10px] font-bold" style={{fontFamily: 'Space Grotesk'}}>JOGOS ANALISADOS</span>
                  <span className="text-[#9ffb00] font-bold text-xl">{jogos}</span>
                </div>
                <div className="bg-[#181d10] p-4 border border-[#414a34]/50 flex justify-between items-center">
                  <span className="text-[#c0caad] tracking-widest text-[10px] font-bold" style={{fontFamily: 'Space Grotesk'}}>XG TOTAL</span>
                  <span className="text-[#ffffff] font-bold text-xl">{estatisticas?.xG ? estatisticas.xG.toFixed(2) : '0.00'}</span>
                </div>
                <div className="bg-[#181d10] p-4 border border-[#414a34]/50 flex justify-between items-center">
                  <span className="text-[#c0caad] tracking-widest text-[10px] font-bold" style={{fontFamily: 'Space Grotesk'}}>XA TOTAL</span>
                  <span className="text-[#ffffff] font-bold text-xl">{estatisticas?.xA ? estatisticas.xA.toFixed(2) : '0.00'}</span>
                </div>
                <div className="bg-[#181d10] p-4 border border-[#414a34]/50 flex justify-between items-center">
                  <span className="text-[#c0caad] tracking-widest text-[10px] font-bold" style={{fontFamily: 'Space Grotesk'}}>PASSES CERTOS</span>
                  <span className="text-[#ffffff] font-bold text-xl">{estatisticas?.passes_certos || 0}</span>
                </div>
                <div className="bg-[#181d10] p-4 border border-[#414a34]/50 flex justify-between items-center">
                  <span className="text-[#c0caad] tracking-widest text-[10px] font-bold" style={{fontFamily: 'Space Grotesk'}}>DUELOS VENCIDOS</span>
                  <span className="text-[#ffffff] font-bold text-xl">{estatisticas?.duelos_vencidos || 0}</span>
                </div>
              </div>
            </div>

            {/* Career Stats Table */}
            <div className="rounded-[0.25rem] flex flex-col col-span-1 lg:col-span-12 mt-6" style={{background: 'rgba(28, 34, 20, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.07)'}}>
              <div className="p-6 border-b border-[#414a34]/30 flex justify-between items-center">
                <div className="text-[#ffffff] tracking-widest text-[12px] font-bold" style={{fontFamily: 'Space Grotesk'}}>MÉTRICAS_DA_TEMPORADA</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#414a34]/50 bg-[#1c2214]/30">
                      <th className="py-4 px-6 text-[#c0caad] tracking-widest text-[10px] font-normal">COMPETIÇÃO</th>
                      <th className="py-4 px-6 text-[#c0caad] tracking-widest text-[10px] font-normal text-right">JOGOS</th>
                      <th className="py-4 px-6 text-[#9ffb00] tracking-widest text-[10px] font-bold text-right">xG</th>
                      <th className="py-4 px-6 text-[#c0caad] tracking-widest text-[10px] font-normal text-right">xA</th>
                      <th className="py-4 px-6 text-[#c0caad] tracking-widest text-[10px] font-normal text-right">PASSES</th>
                      <th className="py-4 px-6 text-[#c0caad] tracking-widest text-[10px] font-normal text-right">DUELOS</th>
                      <th className="py-4 px-6 text-[#c0caad] tracking-widest text-[10px] font-normal text-right">AÇÕES DEF</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-[#414a34]/10 hover:bg-[#1c2214]/40 transition-colors">
                      <td className="py-4 px-6 text-[#ffffff] flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#262c1e] rounded border border-[#414a34]/50 flex items-center justify-center text-[10px] font-bold">ALL</div>
                        Registros Totais do Banco
                      </td>
                      <td className="py-4 px-6 text-right">{jogos}</td>
                      <td className="py-4 px-6 text-[#9ffb00] font-bold text-right text-lg">{estatisticas?.xG ? estatisticas.xG.toFixed(2) : '0.00'}</td>
                      <td className="py-4 px-6 text-right">{estatisticas?.xA ? estatisticas.xA.toFixed(2) : '0.00'}</td>
                      <td className="py-4 px-6 text-right">{estatisticas?.passes_certos || 0}</td>
                      <td className="py-4 px-6 text-right">{estatisticas?.duelos_vencidos || 0}</td>
                      <td className="py-4 px-6 text-right">{(estatisticas?.total_cortes || 0) + (estatisticas?.desarmes_totais || 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
