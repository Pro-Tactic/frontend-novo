import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, AlertCircle, ChevronRight, Zap, Target, Award, Calendar, Search, Activity, Layout } from "lucide-react";
import { api } from "../services/api";
import { resolveMediaUrl } from "../services/media";

export default function Competicoes() {
  const [competicoes, setCompeticoes] = useState([]);
  const [times, setTimes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [filtroJogos, setFiltroJogos] = useState("5");
  const [mostrarTodasEscalacoes, setMostrarTodasEscalacoes] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [error, setError] = useState("");
  const [timesError, setTimesError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [clubeStats, setClubeStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const competicoesRes = await api.get("/ligas/");

        if (!mounted) return;

        const listaCompeticoes = competicoesRes.data || [];
        setCompeticoes(listaCompeticoes);

        if (listaCompeticoes.length > 0) {
          setSelectedId(String(listaCompeticoes[0].id));
        }
      } catch {
        if (!mounted) return;
        setError("Protocolo de competições inacessível.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadTimes() {
      if (!selectedId) {
        setTimes([]);
        setSelectedClub(null);
        setClubeStats(null);
        return;
      }

      setLoadingTimes(true);
      setTimesError("");
      setMostrarTodasEscalacoes(false);

      try {
        const response = await api.get(`/ligas/${selectedId}/times`);
        if (!mounted) return;

        const lista = response.data.map(t => ({ id: t.time_id, nome: t.time.nome_clube, escudo: t.time.foto_clube }));
        setTimes(lista);
        setSelectedClub(null);
        setClubeStats(null);
      } catch {
        if (!mounted) return;
        setTimesError("Falha na varredura de unidades participantes.");
        setTimes([]);
        setSelectedClub(null);
        setClubeStats(null);
      } finally {
        if (mounted) setLoadingTimes(false);
      }
    }

    loadTimes();
    return () => {
      mounted = false;
    };
  }, [selectedId]);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      if (!selectedId || !selectedClub) {
        setClubeStats(null);
        return;
      }

      setLoadingStats(true);
      setStatsError("");

      try {
        // Mocking the stats since the backend doesn't have telemetria endpoint yet
        // but we simulate a fast loading to show "connected" state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted) return;
        setClubeStats({
          estatisticas: { total_jogos: 0, vitorias: 0, derrotas: 0, empates: 0 },
          jogos: [],
          ranking_artilheiros: [],
          ranking_assistentes: [],
          participacoes_gols: [],
          todas_escalacoes: [],
          formacoes_partida: []
        });
      } catch {
        if (!mounted) return;
        setStatsError("Erro ao processar telemetria do clube.");
        setClubeStats(null);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, [selectedId, selectedClub, filtroJogos]);

  const timesDaCompeticao = useMemo(() => times, [times]);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-xl shadow-pt-primary/10">
                <Trophy className="text-pt-primary w-8 h-8" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Competições & clubes</h1>
        </div>
        <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            Análise sistêmica de competições e telemetria de clubes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pt-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-pt-primary/10" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.3em] italic">
              <Zap className="w-4 h-4 text-pt-primary" />
              <h2>Selecionar Competição</h2>
            </div>

            {loading ? (
              <div className="py-10 flex flex-col items-center gap-4">
                 <div className="w-8 h-8 border-2 border-pt-white/5 border-t-pt-primary rounded-full animate-spin" />
                 <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest text-center">Iniciando Varredura...</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</span>
              </div>
            ) : (
              <div className="relative group/select">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-[24px] py-5 px-8 text-pt-text font-black text-xs uppercase tracking-widest focus:outline-none focus:border-pt-primary appearance-none cursor-pointer shadow-inner transition-all hover:bg-pt-bg/80"
                >
                  {competicoes.length === 0 ? (
                    <option value="">NENHUMA COMPETIÇÃO</option>
                  ) : (
                    competicoes.map((competicao) => (
                      <option key={competicao.id} value={competicao.id}>
                        {competicao.nome}
                      </option>
                    ))
                  )}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-pt-primary h-6 w-6 pointer-events-none rotate-90" />
              </div>
            )}
          </div>
        </div>

        {/* Participating Teams */}
        <div className="lg:col-span-2 bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-pt-primary/5 rounded-full blur-[100px] -mr-32 -mb-32 transition-all duration-1000 group-hover:bg-pt-primary/10" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 text-white font-black text-[10px] uppercase tracking-[0.3em] italic">
              <Users className="w-4 h-4 text-pt-primary" />
              <h2>Unidades Participantes</h2>
            </div>

            {loadingTimes ? (
              <div className="py-10 flex flex-col items-center gap-4">
                 <div className="w-8 h-8 border-2 border-pt-white/5 border-t-pt-primary rounded-full animate-spin" />
                 <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest">Mapeando Elencos...</span>
              </div>
            ) : timesError ? (
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{timesError}</p>
            ) : timesDaCompeticao.length === 0 ? (
              <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest opacity-40">Nenhum registro detectado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timesDaCompeticao.map((clube) => (
                  <button
                    key={clube.id}
                    onClick={() => {
                      setSelectedClub(clube);
                      setMostrarTodasEscalacoes(false);
                    }}
                    className={`flex items-center gap-4 rounded-[24px] border px-6 py-4 cursor-pointer transition-all ${
                      selectedClub?.id === clube.id
                        ? "border-pt-primary bg-pt-primary/10 shadow-[0_0_20px_rgba(162,255,1,0.1)]"
                        : "border-pt-white/10 bg-pt-bg/50 hover:border-pt-primary/40 hover:bg-pt-bg/80"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-[18px] bg-white/5 p-2 border border-pt-white/10 flex items-center justify-center overflow-hidden">
                      {clube.escudo ? (
                        <img
                          src={resolveMediaUrl(clube.escudo)}
                          alt={clube.nome}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-pt-text-muted/40" />
                      )}
                    </div>
                    <span className={`font-black uppercase text-xs tracking-widest italic ${selectedClub?.id === clube.id ? 'text-pt-primary' : 'text-white'}`}>
                      {clube.nome}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="bg-pt-surface border border-pt-white/10 rounded-[44px] p-10 shadow-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(162,255,1,0.02)_0%,transparent_60%)] pointer-events-none" />
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10 border-b border-pt-white/5 pb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Estatísticas do Clube</h2>
            <p className="text-[10px] text-pt-text-muted font-black uppercase tracking-[0.3em] italic">Análise de rendimento operacional por unidade.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="relative group/filter">
              <select
                value={filtroJogos}
                onChange={(e) => setFiltroJogos(e.target.value)}
                className="bg-pt-bg border border-pt-white/10 rounded-full py-3 px-8 text-[10px] font-black text-pt-text-muted uppercase tracking-widest focus:outline-none focus:border-pt-primary appearance-none cursor-pointer transition-all hover:text-white"
              >
                <option value="5">ÚLTIMOS 5 JOGOS</option>
                <option value="10">ÚLTIMOS 10 JOGOS</option>
                <option value="all">TODOS OS JOGOS</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-pt-primary h-4 w-4 pointer-events-none rotate-90" />
            </div>

            {selectedClub && (
              <div className="flex items-center gap-4 bg-pt-bg/50 px-6 py-2.5 rounded-full border border-pt-white/10">
                <div className="w-8 h-8 rounded-lg bg-white/5 p-1 border border-pt-white/5">
                  {selectedClub.escudo && (
                    <img
                      src={resolveMediaUrl(selectedClub.escudo)}
                      alt={selectedClub.nome}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <span className="text-[10px] font-black text-pt-primary uppercase tracking-[0.2em] italic">{selectedClub.nome}</span>
              </div>
            )}
          </div>
        </header>

        {loadingStats ? (
          <div className="py-20 flex flex-col items-center gap-6">
             <div className="w-12 h-12 border-4 border-pt-white/5 border-t-pt-primary rounded-full animate-spin" />
             <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.4em] animate-pulse">Sincronizando Core Data...</span>
          </div>
        ) : statsError ? (
          <p className="text-sm font-black text-red-500 uppercase tracking-widest p-10 bg-red-500/5 rounded-[32px] border border-red-500/10">{statsError}</p>
        ) : !clubeStats ? (
          <div className="py-24 text-center space-y-6">
             <div className="w-20 h-20 bg-pt-bg rounded-[32px] flex items-center justify-center mx-auto border border-pt-white/10">
                <Search className="text-pt-white/5 w-10 h-10" />
             </div>
             <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.4em] italic opacity-40">Selecione uma unidade operacional para carregar telemetria.</p>
          </div>
        ) : (
          <div className="space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Stat Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatBox label="Jogos" value={clubeStats.estatisticas.total_jogos} icon={<Activity className="w-4 h-4" />} />
              <StatBox label="Vitórias" value={clubeStats.estatisticas.vitorias} icon={<Award className="w-4 h-4 text-pt-primary" />} />
              <StatBox label="Derrotas" value={clubeStats.estatisticas.derrotas} icon={<AlertCircle className="w-4 h-4 text-red-500" />} />
              <StatBox label="Empates" value={clubeStats.estatisticas.empates} icon={<Layout className="w-4 h-4 text-pt-text-muted" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Lineup Module */}
              <section className="rounded-[40px] border border-pt-white/10 bg-pt-bg/40 p-8 shadow-inner space-y-6">
                <div className="flex items-center justify-between mb-4">
                   <div className="space-y-1">
                      <h3 className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] italic">Escalação mais utilizada</h3>
                      <h4 className="text-4xl font-black text-pt-primary italic tracking-tighter drop-shadow-md">
                        {clubeStats.escalacao_mais_usada?.formacao || '---'}
                      </h4>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic block mb-1">Frequência</span>
                      <span className="text-2xl font-black text-white italic tabular-nums">{clubeStats.escalacao_mais_usada?.vezes || 0}x</span>
                   </div>
                </div>

                <div className="relative pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarTodasEscalacoes((prev) => !prev)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[18px] border border-pt-white/10 text-[10px] font-black text-pt-primary uppercase tracking-[0.3em] hover:bg-pt-primary hover:text-pt-bg transition-all active:scale-[0.98]"
                  >
                    {mostrarTodasEscalacoes ? "Ocultar Dados" : "Ver Todas Escalações"}
                    <ChevronRight className={`w-4 h-4 transition-transform ${mostrarTodasEscalacoes ? '-rotate-90' : 'rotate-90'}`} />
                  </button>

                  {mostrarTodasEscalacoes && (
                    <div className="mt-6 space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-4 duration-500">
                      {(clubeStats.todas_escalacoes || []).map((f) => (
                        <div key={f.formacao} className="flex items-center justify-between bg-pt-bg border border-pt-white/5 rounded-2xl px-6 py-4 transition-all hover:border-pt-primary/30 group/f">
                          <span className="font-black text-sm text-white italic tracking-widest">{f.formacao}</span>
                          <span className="text-[10px] font-black text-pt-primary italic group-hover/f:scale-110 transition-transform">{f.vezes}x</span>
                        </div>
                      ))}

                      {(clubeStats.formacoes_partida || []).map((f) => (
                        <div key={f.partida_id} className="bg-pt-bg border border-pt-white/5 rounded-[28px] p-6 space-y-6">
                          <div className="flex items-center justify-between border-b border-pt-white/5 pb-4">
                            <span className="text-sm font-black text-pt-primary italic tracking-widest uppercase">{f.formacao}</span>
                            <div className="flex items-center gap-2 text-[10px] font-black text-pt-text-muted/40 uppercase tracking-widest">
                               <Calendar className="w-3.5 h-3.5" />
                               {f.data}
                            </div>
                          </div>
                          <div className="text-sm font-black text-white italic uppercase tracking-tighter">vs {f.adversario}</div>
                          <LineupFieldPreview titulares={f.titulares || []} />
                          <div className="flex flex-wrap gap-2 pt-2">
                            {(f.titulares || []).map((j) => (
                              <span
                                key={`${f.partida_id}-${j.jogador_id}`}
                                className="px-3 py-1.5 rounded-xl border border-pt-white/5 bg-white/5 text-[9px] font-black text-pt-text-muted uppercase tracking-widest hover:border-pt-primary/20 transition-colors"
                              >
                                {j.nome}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[40px] border border-pt-white/10 bg-pt-bg/40 p-8 shadow-inner space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] italic">Jogos na Competição</h3>
                   <div className="w-8 h-px bg-pt-white/10 flex-1 mx-6" />
                </div>
                
                {clubeStats.jogos.length === 0 ? (
                  <p className="py-20 text-center text-[10px] font-black text-pt-text-muted/40 uppercase tracking-widest italic">Clube sem jogos registrados</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {clubeStats.jogos.map((jogo) => (
                      <div key={jogo.id} className="rounded-[24px] border border-pt-white/5 bg-pt-bg/40 p-5 hover:border-pt-primary/30 transition-all group/match">
                        <div className="flex items-center justify-between mb-2">
                           <div className="text-sm font-black text-white uppercase italic tracking-tighter">
                             {jogo.mandante} <span className="text-pt-primary mx-2">{jogo.placar_mandante} x {jogo.placar_visitante}</span> {jogo.visitante}
                           </div>
                           <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                             jogo.resultado === 'V' ? 'bg-pt-primary/20 text-pt-primary' : 
                             jogo.resultado === 'D' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-pt-text-muted'
                           }`}>
                             {jogo.resultado === 'V' ? 'VIC' : jogo.resultado === 'D' ? 'DEF' : 'DRW'}
                           </div>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black text-pt-text-muted/40 uppercase tracking-[0.2em] italic">
                          <Calendar className="w-3 h-3" />
                          {jogo.data}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <section className="rounded-[40px] border border-pt-white/10 bg-pt-bg/40 p-8 shadow-inner space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <Target className="w-5 h-5 text-pt-primary" />
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Ranking de Artilheiros</h3>
                </div>
                {(clubeStats.ranking_artilheiros || []).length === 0 ? (
                  <p className="text-[10px] font-black text-pt-text-muted/40 uppercase tracking-widest italic py-10 text-center">Nenhum dado registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {clubeStats.ranking_artilheiros.map((item, index) => (
                      <div key={item.jogador_id} className="flex items-center justify-between rounded-2xl border border-pt-white/5 bg-pt-bg/60 px-6 py-4 group/item">
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-black text-pt-primary italic w-6">0{index + 1}</span>
                           <span className="text-xs font-black text-white uppercase italic tracking-widest">{item.nome}</span>
                        </div>
                        <span className="text-xl font-black text-pt-primary italic tabular-nums group-hover/item:scale-110 transition-transform">{item.gols}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[40px] border border-pt-white/10 bg-pt-bg/40 p-8 shadow-inner space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <Layout className="w-5 h-5 text-sky-400" />
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Ranking de Assistentes</h3>
                </div>
                {(clubeStats.ranking_assistentes || []).length === 0 ? (
                  <p className="text-[10px] font-black text-pt-text-muted/40 uppercase tracking-widest italic py-10 text-center">Nenhuma assistência detectada.</p>
                ) : (
                  <div className="space-y-3">
                    {clubeStats.ranking_assistentes.map((item, index) => (
                      <div key={item.jogador_id} className="flex items-center justify-between rounded-2xl border border-pt-white/5 bg-pt-bg/60 px-6 py-4 group/item">
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] font-black text-sky-400 italic w-6">0{index + 1}</span>
                           <span className="text-xs font-black text-white uppercase italic tracking-widest">{item.nome}</span>
                        </div>
                        <span className="text-xl font-black text-sky-400 italic tabular-nums group-hover/item:scale-110 transition-transform">{item.assistencias}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Event Timeline */}
            <section className="rounded-[40px] border border-pt-white/10 bg-pt-bg/40 p-10 shadow-inner space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Gols e Assistências do Clube</h3>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-pt-primary animate-pulse" />
                   <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] italic">Varredura de Eventos</span>
                </div>
              </div>

              {(clubeStats.participacoes_gols || []).length === 0 ? (
                <p className="py-24 text-center text-[10px] font-black text-pt-text-muted/40 uppercase tracking-[0.4em] italic">NENHUMA PARTICIPAÇÃO REGISTRADA.</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {clubeStats.participacoes_gols.map((item, index) => (
                    <div key={`${item.partida_id}-${index}`} className="rounded-[32px] border border-pt-white/5 bg-pt-bg/60 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-pt-primary/20 transition-all group/event">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-[10px] font-black text-pt-text-muted/40 uppercase tracking-widest italic">
                           <Calendar className="w-4 h-4" />
                           {item.data}
                           <span className="mx-2 text-pt-white/10">|</span>
                           <span>vs {item.adversario}</span>
                        </div>
                        <div className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover/event:text-pt-primary transition-colors">
                          {item.autor}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 md:text-right">
                        {item.assistencia && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-pt-text-muted/30 uppercase tracking-widest block italic">Assistência de</span>
                            <span className="text-sm font-black text-sky-400/80 uppercase italic tracking-widest">{item.assistencia}</span>
                          </div>
                        )}
                        {item.minuto && (
                          <div className="bg-pt-bg border border-pt-white/10 px-6 py-3 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
                            <span className="text-[9px] font-black text-pt-text-muted/30 uppercase tracking-[0.3em] block mb-1">Minuto</span>
                            <span className="text-xl font-black text-pt-primary italic tabular-nums">{item.minuto}'</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 opacity-20 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="rounded-[28px] border border-pt-white/10 bg-pt-bg/50 px-8 py-6 group hover:border-pt-primary/30 transition-all shadow-inner">
      <div className="flex items-center gap-3 mb-2">
         <div className="opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
         <div className="text-[10px] text-pt-text-muted/60 uppercase tracking-[0.2em] font-black italic">{label}</div>
      </div>
      <div className="text-4xl font-black text-white italic tabular-nums tracking-tighter group-hover:text-pt-primary transition-colors">{value}</div>
    </div>
  );
}

const POSITION_FALLBACK_SLOTS = {
  Goleiro: [{ x: 50, y: 92 }],
  "Lateral Esquerdo": [{ x: 16, y: 74 }],
  Zagueiro: [{ x: 32, y: 76 }, { x: 50, y: 76 }, { x: 68, y: 76 }],
  "Lateral Direito": [{ x: 84, y: 74 }],
  Volante: [{ x: 40, y: 62 }, { x: 60, y: 62 }],
  "Meio-campista": [{ x: 33, y: 52 }, { x: 50, y: 50 }, { x: 67, y: 52 }],
  "Meia Atacante": [{ x: 50, y: 42 }],
  "Ponta Esquerda": [{ x: 24, y: 30 }],
  "Ponta Direita": [{ x: 76, y: 30 }],
  Centroavante: [{ x: 50, y: 20 }],
};

function getFallbackCoordinate(posicao, usedCountByPosicao) {
  const slots = POSITION_FALLBACK_SLOTS[posicao] || [{ x: 50, y: 50 }];
  const currentIndex = usedCountByPosicao[posicao] || 0;
  usedCountByPosicao[posicao] = currentIndex + 1;

  if (currentIndex < slots.length) {
    return slots[currentIndex];
  }

  const base = slots[currentIndex % slots.length];
  const stackOffset = Math.floor(currentIndex / slots.length) * 3;
  return {
    x: Math.max(5, Math.min(95, base.x + (currentIndex % 2 === 0 ? stackOffset : -stackOffset))),
    y: Math.max(8, Math.min(95, base.y - stackOffset)),
  };
}

function LineupFieldPreview({ titulares }) {
  const usedCountByPosicao = {};

  const players = (titulares || []).map((j) => {
    const hasCoord = j?.x !== null && j?.x !== undefined && j?.y !== null && j?.y !== undefined;
    const fallback = getFallbackCoordinate(j?.posicao, usedCountByPosicao);

    return {
      ...j,
      x: hasCoord ? Number(j.x) : fallback.x,
      y: hasCoord ? Number(j.y) : fallback.y,
    };
  });

  return (
    <div className="relative h-48 rounded-[32px] border border-pt-white/10 bg-pt-bg overflow-hidden shadow-inner group/field">
      {/* Tactical Radar Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(162,255,1,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(162,255,1,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-pt-white/10 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-pt-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 left-1/2 w-24 h-12 border border-pt-white/10 rounded-b-2xl -translate-x-1/2" />
      <div className="absolute bottom-0 left-1/2 w-24 h-12 border border-pt-white/10 rounded-t-2xl -translate-x-1/2" />

      {players.map((j) => (
        <div
          key={j.jogador_id}
          className="absolute -translate-x-1/2 -translate-y-1/2 group/marker transition-all duration-500 hover:scale-125 z-20"
          style={{ left: `${j.x}%`, top: `${j.y}%` }}
          title={`${j.nome} (${j.posicao})`}
        >
          <div className="w-6 h-6 rounded-full bg-pt-surface border-2 border-pt-primary text-[8px] text-pt-primary font-black flex items-center justify-center shadow-[0_0_10px_rgba(162,255,1,0.5)] group-hover/marker:bg-pt-primary group-hover/marker:text-pt-bg">
            {(j.nome || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover/marker:block whitespace-nowrap bg-pt-bg border border-pt-white/10 px-2 py-1 rounded-lg text-[7px] font-black text-white uppercase tracking-widest z-30">
             {j.nome}
          </div>
        </div>
      ))}
    </div>
  );
}
