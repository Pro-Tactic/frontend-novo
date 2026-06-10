import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ChevronDown, Calendar, User as UserIcon, Trophy } from 'lucide-react';

const Clube = () => {
  const [timesDisponiveis, setTimesDisponiveis] = useState([]);
  const [selectedTimeId, setSelectedTimeId] = useState("");
  const [jogadores, setJogadores] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchTimes = async () => {
      try {
        const response = await api.get('/times/');
        if (mounted) {
          const times = response.data || [];
          setTimesDisponiveis(times);
          if (times.length > 0) setSelectedTimeId(times[0].id);
          setLoadingTimes(false);
        }
      } catch (err) {
        if (mounted) setLoadingTimes(false);
      }
    };
    fetchTimes();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedTimeId) return;
    
    let mounted = true;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [jogadoresRes, partidasRes] = await Promise.all([
          api.get(`/jogadores/time/${selectedTimeId}`),
          api.get(`/partidas/time/${selectedTimeId}`)
        ]);
        
        if (mounted) {
          setJogadores(jogadoresRes.data || []);
          setPartidas(partidasRes.data || []);
        }
      } catch (err) {
        console.error("Erro ao buscar dados do time", err);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    
    fetchData();
    return () => { mounted = false; };
  }, [selectedTimeId]);

  return (
    <div className="animate-in fade-in duration-1000 max-w-[1400px] mx-auto pb-10">
      
      {/* HEADER / SELECTOR */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-[#111111]/80 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Gestão de Clubes</h1>
            <p className="text-gray-400 text-sm font-medium">Selecione um clube para ver seu elenco e histórico</p>
          </div>
        </div>

        <div className="relative group">
          <select 
            value={selectedTimeId}
            onChange={(e) => setSelectedTimeId(e.target.value)}
            className="appearance-none bg-[#1A1A1A] border border-white/10 text-white font-bold py-3 pl-6 pr-12 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer shadow-lg w-full md:w-64"
          >
            {loadingTimes ? (
              <option>Carregando...</option>
            ) : timesDisponiveis.length > 0 ? (
              timesDisponiveis.map(t => (
                <option key={t.id} value={t.id}>{t.nome_clube}</option>
              ))
            ) : (
              <option value="">Nenhum Clube</option>
            )}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ESQUERDA: ELENCO (Ocupa 2 colunas na grid) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <UserIcon className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-black text-white tracking-wide uppercase">Elenco Principal</h2>
              <span className="bg-white/10 text-xs font-bold px-3 py-1 rounded-full text-gray-300 ml-auto">
                {jogadores.length} Jogadores
              </span>
            </div>

            {jogadores.length === 0 ? (
              <div className="bg-[#111111]/50 border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <UserIcon className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum jogador encontrado</h3>
                <p className="text-gray-500">Este clube não possui jogadores cadastrados no banco de dados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {jogadores.map((jog) => (
                  <div key={jog.id} className="bg-[#151515] border border-white/5 rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-[#1A1A1A] transition-all group shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10 font-black text-xl text-cyan-400">
                        {jog.numero_camisa_clube || "-"}
                      </div>
                      <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase bg-black/50 px-2 py-1 rounded-md">
                        {jog.posicao_principal || "Sem Pos"}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-300 transition-colors">
                      {jog.apelido || jog.nome_completo || "Jogador Desconhecido"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {jog.nome_completo}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIREITA: ÚLTIMOS JOGOS */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-black text-white tracking-wide uppercase">Últimos Jogos</h2>
            </div>

            <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              {partidas.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-500 font-medium">Nenhuma partida registrada para este clube.</p>
                </div>
              ) : (
                partidas.map((p) => {
                  const isMandante = p.id_mandante === Number(selectedTimeId);
                  const isVitoria = isMandante ? p.placar_mandante > p.placar_visitante : p.placar_visitante > p.placar_mandante;
                  const isEmpate = p.placar_mandante === p.placar_visitante;
                  
                  let resultColor = isEmpate ? "bg-gray-500/20 text-gray-400" : (isVitoria ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400");
                  let resultChar = isEmpate ? "E" : (isVitoria ? "V" : "D");

                  return (
                    <div key={p.id} className="flex flex-col bg-black/40 rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-gray-500">
                          {new Date(p.data_hora_partida).toLocaleDateString('pt-BR')}
                        </span>
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black ${resultColor}`}>
                          {resultChar}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-sm truncate flex-1 text-right ${isMandante ? 'text-white' : 'text-gray-400'}`}>
                          {isMandante ? "Seu Clube" : `Adv ${p.id_mandante}`}
                        </span>
                        
                        <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-lg border border-white/10">
                          <span className="font-black text-white">{p.placar_mandante}</span>
                          <span className="text-gray-600 text-xs font-black">X</span>
                          <span className="font-black text-white">{p.placar_visitante}</span>
                        </div>
                        
                        <span className={`font-bold text-sm truncate flex-1 text-left ${!isMandante ? 'text-white' : 'text-gray-400'}`}>
                          {!isMandante ? "Seu Clube" : `Adv ${p.id_visitante}`}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Clube;