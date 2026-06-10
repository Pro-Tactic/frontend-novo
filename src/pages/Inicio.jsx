import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { resolveMediaUrl } from '../services/media';
import { Calendar, ChevronDown, FileText, Activity } from 'lucide-react';

const Inicio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabelaData, setTabelaData] = useState(null);
  const [relatorioData, setRelatorioData] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [selectedLigaId, setSelectedLigaId] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const response = await api.get('/home/');
        if (mounted) {
          setData(response.data);
          
          const isAnalista = response.data.tipo_usuario.toLowerCase().includes('analista');
          if (isAnalista) {
            if (response.data.campeonatos && response.data.campeonatos.length > 0) {
              setSelectedLigaId(response.data.campeonatos[0].id);
            }
          } else {
            api.get('/home/relatorio').then(relRes => {
              if (mounted) setRelatorioData(relRes.data);
            }).catch(() => {
              if (mounted) setRelatorioData({error: true});
            });
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Falha ao carregar dashboard. Servidor inacessível.');
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchTabela = async () => {
      if (!selectedLigaId) return;
      setLoadingExtra(true);
      try {
        const res = await api.get(`/home/campeonatos/${selectedLigaId}/tabela`);
        if (mounted) {
          setTabelaData(res.data);
          setLoadingExtra(false);
        }
      } catch (e) {
        if (mounted) setLoadingExtra(false);
      }
    };
    fetchTabela();
    return () => { mounted = false; };
  }, [selectedLigaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-pt-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500 font-black tracking-widest uppercase">
        {error || 'Erro ao carregar dados.'}
      </div>
    );
  }

  const isAnalista = data.tipo_usuario.toLowerCase().includes('analista');
  const initials = data.usuario.nome.slice(0, 2).toUpperCase();

  return (
    <div className="animate-in fade-in duration-1000">
      {/* 
        A grid layout to match the prototype exact structure: 
        Left column for avatar, form, calendar.
        Right column for the main yellow box.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 max-w-[1200px] mx-auto">
        
        {/* ESQUERDA: Avatar, V-E-D, Calendário */}
        <div className="flex flex-col gap-6 items-center">
          
          {/* Avatar Circle */}
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] border-4 border-blue-400 overflow-hidden relative">
             {data.clube?.foto_clube ? (
               <img src={resolveMediaUrl(data.clube.foto_clube)} alt="Clube" className="w-full h-full object-contain p-4" />
             ) : (
               <span className="text-5xl font-black text-white">{initials}</span>
             )}
          </div>

          {/* V-E-D Indicator */}
          {isAnalista ? (
             <div className="w-48 h-12 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white text-xl uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                {data.form.join(' - ')}
             </div>
          ) : (
             <div className="flex flex-col items-center gap-2">
                <div className="w-48 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-black text-white text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                   FASE RECENTE
                </div>
                <div className="font-black text-blue-400 text-lg uppercase tracking-[0.3em]">
                   {data.form.join(' - ')}
                </div>
             </div>
          )}

          {/* Calendário Box */}
          <div className="w-full max-w-[300px] h-48 bg-red-600 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-105 transition-transform cursor-pointer group relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity" />
             <Calendar className="w-12 h-12 text-white mb-4 opacity-50" />
             <span className="font-black text-white text-2xl uppercase tracking-tighter">CALENDÁRIO</span>
          </div>
          
        </div>

        {/* DIREITA: Main Yellow Box */}
        <div className="flex flex-col">
          <div className="w-full h-full min-h-[400px] bg-yellow-400 rounded-3xl p-8 flex flex-col shadow-[0_0_40px_rgba(250,204,21,0.2)] relative overflow-hidden group">
            
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-50 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full">
               {isAnalista ? (
                 <>
                   <div className="self-end md:self-start bg-blue-500 rounded-xl px-4 py-2 flex items-center gap-2 mb-10 shadow-lg cursor-pointer hover:bg-blue-400 transition-colors">
                     <select 
                       value={selectedLigaId} 
                       onChange={(e) => setSelectedLigaId(e.target.value)}
                       className="bg-transparent text-white font-black text-xs uppercase tracking-widest outline-none appearance-none cursor-pointer">
                        {data.campeonatos && data.campeonatos.length > 0 ? (
                           data.campeonatos.map(c => (
                             <option key={c.id} value={c.id} className="text-black bg-white">{c.nome_liga || c.nome}</option>
                           ))
                        ) : (
                           <option value="">Sem Campeonatos</option>
                        )}
                     </select>
                     <ChevronDown className="w-4 h-4 text-white" />
                   </div>
                   
                   <div className="flex-1 flex flex-col w-full overflow-hidden bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-2 md:p-4">
                      {loadingExtra ? (
                         <div className="flex-1 flex items-center justify-center">
                            <Activity className="w-8 h-8 text-yellow-600 animate-spin" />
                         </div>
                      ) : tabelaData && tabelaData.length > 0 ? (
                         <div className="overflow-auto max-h-[350px] md:max-h-[500px] w-full custom-scrollbar">
                           <table className="w-full text-left border-collapse">
                             <thead>
                               <tr className="border-b-2 border-yellow-500/30 text-yellow-900 font-black text-xs uppercase tracking-wider sticky top-0 bg-yellow-400 z-10 shadow-sm">
                                 <th className="p-2">Pos</th>
                                 <th className="p-2">Clube</th>
                                 <th className="p-2 text-center">PTS</th>
                                 <th className="p-2 text-center hidden md:table-cell">J</th>
                                 <th className="p-2 text-center">V</th>
                                 <th className="p-2 text-center hidden md:table-cell">E</th>
                                 <th className="p-2 text-center hidden md:table-cell">D</th>
                                 <th className="p-2 text-center hidden lg:table-cell">GP</th>
                                 <th className="p-2 text-center hidden lg:table-cell">GC</th>
                                 <th className="p-2 text-center">SG</th>
                               </tr>
                             </thead>
                             <tbody className="text-sm font-bold text-yellow-950">
                               {tabelaData.map((row) => (
                                 <tr key={row.id_clube} className={`border-b border-yellow-500/10 hover:bg-white/40 transition-colors ${row.id_clube === data.clube?.id ? 'bg-yellow-100/50' : ''}`}>
                                   <td className="p-2">{row.posicao}º</td>
                                   <td className="p-2 flex items-center gap-2">
                                     {row.foto_clube && (
                                        <img src={resolveMediaUrl(row.foto_clube)} alt={row.nome_clube} className="w-6 h-6 object-contain" />
                                     )}
                                     <span className="truncate max-w-[100px] md:max-w-[180px]">{row.nome_clube}</span>
                                   </td>
                                   <td className="p-2 text-center font-black text-blue-600">{row.pontos}</td>
                                   <td className="p-2 text-center hidden md:table-cell">{row.jogos}</td>
                                   <td className="p-2 text-center">{row.vitorias}</td>
                                   <td className="p-2 text-center hidden md:table-cell">{row.empates}</td>
                                   <td className="p-2 text-center hidden md:table-cell">{row.derrotas}</td>
                                   <td className="p-2 text-center hidden lg:table-cell">{row.gols_pro}</td>
                                   <td className="p-2 text-center hidden lg:table-cell">{row.gols_contra}</td>
                                   <td className="p-2 text-center">{row.saldo_gols}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <Activity className="w-16 h-16 text-yellow-600 mb-6" />
                            <h2 className="font-black text-yellow-900 text-2xl uppercase tracking-tighter">
                              SEM DADOS
                            </h2>
                         </div>
                      )}
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col w-full h-full">
                    <h2 className="font-black text-yellow-900 text-3xl uppercase tracking-tighter mb-6 flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      Relatório da Temporada
                    </h2>
                    
                    {relatorioData && !relatorioData.error ? (
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                         <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/40 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform">
                           <span className="text-yellow-900 font-black text-xs uppercase tracking-widest mb-1">Jogos</span>
                           <span className="text-4xl font-black text-blue-600">{relatorioData.total_jogos}</span>
                         </div>
                         <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/40 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform">
                           <span className="text-yellow-900 font-black text-xs uppercase tracking-widest mb-1">Vitórias</span>
                           <span className="text-4xl font-black text-green-600">{relatorioData.vitorias}</span>
                         </div>
                         <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/40 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform">
                           <span className="text-yellow-900 font-black text-xs uppercase tracking-widest mb-1">Gols Pró</span>
                           <span className="text-4xl font-black text-blue-600">{relatorioData.gols_pro}</span>
                         </div>
                         <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/40 flex flex-col items-center justify-center text-center shadow-lg hover:scale-105 transition-transform">
                           <span className="text-yellow-900 font-black text-xs uppercase tracking-widest mb-1">Saldo</span>
                           <span className="text-4xl font-black text-blue-600">{relatorioData.saldo_gols}</span>
                         </div>
                         
                         <div className="col-span-2 md:col-span-4 bg-blue-600 rounded-2xl p-4 text-white shadow-lg mt-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-transparent opacity-50"></div>
                            <span className="relative z-10 block font-black text-xs uppercase tracking-widest mb-3 opacity-80">Últimos Resultados</span>
                            <div className="relative z-10 flex flex-wrap gap-3">
                              {relatorioData.ultimos_jogos.map((jogo, idx) => {
                                const isWin = jogo.startsWith('V');
                                const isDraw = jogo.startsWith('E');
                                return (
                                  <div key={idx} className={`px-4 py-2 rounded-xl font-black tracking-widest text-sm flex items-center justify-center border-2 border-white/20 shadow-md ${isWin ? 'bg-green-500' : isDraw ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                    {jogo}
                                  </div>
                                )
                              })}
                              {relatorioData.ultimos_jogos.length === 0 && (
                                <span className="text-sm font-medium opacity-80">Nenhum jogo recente.</span>
                              )}
                            </div>
                         </div>
                       </div>
                    ) : relatorioData?.error ? (
                       <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                          <h2 className="font-black text-yellow-900 text-xl uppercase tracking-tighter">
                            NÃO HÁ DADOS SUFICIENTES
                          </h2>
                       </div>
                    ) : (
                       <div className="flex-1 flex items-center justify-center opacity-50">
                          <Activity className="w-12 h-12 text-yellow-600 animate-spin" />
                       </div>
                    )}
                 </div>
               )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inicio;