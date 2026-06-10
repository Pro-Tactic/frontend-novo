import { useState, useEffect } from "react";
import { api, extractList } from "../services/api";
import { Save, Search, User as UserIcon, ChevronRight, Check, Zap, Target, Star, Award, TrendingUp } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Notas() {
  const [partidas, setPartidas] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [partidaSelecionada, setPartidaSelecionada] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [performanceData, setPerformanceData] = useState({});

  const partidaAtual = partidas.find((p) => p.id === partidaSelecionada) || null;

  const toInt = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getGolsDoMeuTime = (partida, elenco) => {
    if (!partida || !elenco?.length) return null;
    const meuClubeId = elenco[0]?.clube;
    if (!meuClubeId) return null;

    if (partida.mandante === meuClubeId) return Number(partida.placar_mandante || 0);
    if (partida.visitante === meuClubeId) return Number(partida.placar_visitante || 0);
    return null;
  };

  useEffect(() => {
    async function loadPartidas() {
      try {
        const response = await api.get("/partidas/");
        setPartidas(extractList(response.data));
      } catch (error) {
        console.error("Erro ao carregar partidas", error);
      }
    }
    loadPartidas();
  }, []);

  useEffect(() => {
    if (!partidaSelecionada) return;

    async function loadDadosPartida() {
      setLoading(true);
      try {
        const [resJogadores, resDesempenhos, resEscalacoes] = await Promise.all([
          api.get("/jogadores/"),
          api.get(`/desempenhos/?partida=${partidaSelecionada}`),
          api.get(`/escalacoes/?partida=${partidaSelecionada}&tipo=PADRAO`),
        ]);

        const escalacoes = extractList(resEscalacoes.data);
        const jogadores = extractList(resJogadores.data);
        const desempenhos = extractList(resDesempenhos.data);

        const titularesIds = new Set(
          escalacoes
            .filter((e) => e.status === "TITULAR")
            .map((e) => (typeof e.jogador === "object" ? e.jogador.id : e.jogador))
        );

        const jogadoresTitulares = jogadores.filter((j) => titularesIds.has(j.id));
        setJogadores(jogadoresTitulares);

        const dadosIniciais = {};
        desempenhos.forEach(d => {
            if (!titularesIds.has(d.jogador)) return;
            dadosIniciais[d.jogador] = {
                id: d.id,
                nota: d.nota,
                gols: d.gols,
                gols_contra: d.gols_contra,
                assistencias: d.assistencias
            };
        });
        setPerformanceData(dadosIniciais);

      } catch (error) {
        console.error("Erro ao carregar dados", error);
        MySwal.fire({ 
          icon: 'error', 
          title: 'FALHA TÉCNICA', 
          text: 'O sistema não conseguiu sincronizar os dados da partida.',
          background: '#0B0B0B',
          color: '#FEFEFE',
          confirmButtonColor: '#A2FF01'
        });
      } finally {
        setLoading(false);
      }
    }

    loadDadosPartida();
  }, [partidaSelecionada]);

  const golsDoTime = getGolsDoMeuTime(partidaAtual, jogadores);

  const handleInputChange = (jogadorId, field, value) => {
    setPerformanceData(prev => ({
      ...prev,
      [jogadorId]: {
        ...prev[jogadorId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!partidaSelecionada) {
      MySwal.fire({ 
        icon: 'warning', 
        title: 'PARTIDA INDEFINIDA', 
        text: 'Selecione um evento alvo antes de processar as notas.',
        background: '#0B0B0B',
        color: '#FEFEFE'
      });
      return;
    }

    const desempenhosPayload = jogadores.map((jogador) => {
      const dados = performanceData[jogador.id] || {};
      return {
        partida: partidaSelecionada,
        jogador: jogador.id,
        nota: dados.nota === "" || dados.nota === undefined ? 0 : dados.nota,
        gols: toInt(dados.gols),
        gols_contra: toInt(dados.gols_contra),
        assistencias: toInt(dados.assistencias),
      };
    });

    if (golsDoTime === null) {
      MySwal.fire({
        icon: 'error',
        title: 'ERRO DE SINCRONIA',
        text: 'Placar oficial não detectado para este clube.',
        background: '#0B0B0B',
        color: '#FEFEFE'
      });
      return;
    }

    const totalGols = desempenhosPayload.reduce((acc, item) => acc + item.gols, 0);
    const totalGolsContra = desempenhosPayload.reduce((acc, item) => acc + item.gols_contra, 0);
    const totalAssistencias = desempenhosPayload.reduce((acc, item) => acc + item.assistencias, 0);

    if (totalGols + totalGolsContra !== golsDoTime) {
      MySwal.fire({
        icon: 'warning',
        title: 'INCONSISTÊNCIA DE GOLS',
        text: `A soma (${totalGols + totalGolsContra}) diverge do placar oficial (${golsDoTime}).`,
        background: '#0B0B0B',
        color: '#FEFEFE'
      });
      return;
    }

    if (totalAssistencias > golsDoTime) {
      MySwal.fire({
        icon: 'warning',
        title: 'EXCESSO DE ASSISTÊNCIAS',
        text: `Volume de assistências (${totalAssistencias}) supera o total de gols (${golsDoTime}).`,
        background: '#0B0B0B',
        color: '#FEFEFE'
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/desempenhos/bulk-save/', { desempenhos: desempenhosPayload });
      MySwal.fire({
        icon: 'success',
        title: 'DADOS COMPUTADOS',
        text: 'A performance individual foi integrada ao banco de inteligência.',
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#A2FF01'
      });
    } catch (err) {
      const apiMsg =
        err?.response?.data?.desempenhos ||
        err?.response?.data?.jogador ||
        err?.response?.data?.gols ||
        err?.response?.data?.assistencias ||
        err?.response?.data?.detail;
      MySwal.fire({
        icon: 'error',
        title: 'FALHA NO ARQUIVAMENTO',
        text: Array.isArray(apiMsg) ? apiMsg[0] : (apiMsg || 'Erro nos parâmetros de performance.'),
        background: '#0B0B0B',
        color: '#FEFEFE'
      });
    } finally {
      setLoading(false);
    }
  };

  const resumoGols = jogadores.reduce((acc, jogador) => {
    const dados = performanceData[jogador.id] || {};
    acc.gols += toInt(dados.gols);
    acc.golsContra += toInt(dados.gols_contra);
    acc.assistencias += toInt(dados.assistencias);
    return acc;
  }, { gols: 0, golsContra: 0, assistencias: 0 });

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-sans selection:bg-pt-primary selection:text-pt-bg">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-xl shadow-pt-primary/10">
              <Star className="text-pt-primary w-8 h-8" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Avaliação de Desempenho</h1>
          </div>
          <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            Mapeamento de desempenho para o núcleo operacional.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        
        {/* Selector Card */}
        <div className="bg-pt-surface border border-pt-white/10 rounded-[44px] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pt-primary/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-pt-primary/10 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-6">
            <label className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] ml-2 italic">
              Seletor de Confronto
            </label>
            <div className="relative group/field">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pt-primary h-5 w-5 group-focus-within/field:scale-110 transition-transform" />
              <select
                className="w-full bg-pt-bg border border-pt-white/10 rounded-[28px] py-6 pl-16 pr-12 text-pt-text focus:outline-none focus:border-pt-primary appearance-none cursor-pointer shadow-inner hover:bg-pt-bg/80 transition-all font-semibold"
                value={partidaSelecionada}
                onChange={(e) => setPartidaSelecionada(e.target.value)}
              >
                <option value="">FILTRAR EVENTOS OPERACIONAIS</option>
                {partidas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome_mandante} vs {p.nome_visitante} // {new Date(p.data_hora).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-pt-primary h-6 w-6 pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        {partidaSelecionada && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            {/* Highlights Bar */}
            {partidaAtual && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SummaryCard 
                  icon={<Award className="w-5 h-5" />}
                  label="Gols Registrados" 
                  value={golsDoTime ?? '-'} 
                  sub={`PLACAR OFICIAL`}
                />
                <SummaryCard 
                  icon={<Target className="w-5 h-5" />}
                  label="Gols Atribuídos" 
                  value={resumoGols.gols + resumoGols.golsContra} 
                  sub={`${resumoGols.gols} PRO / ${resumoGols.golsContra} Contra`}
                  status={resumoGols.gols + resumoGols.golsContra === (golsDoTime || 0)}
                />
                <SummaryCard 
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Assistências" 
                  value={resumoGols.assistencias} 
                  sub={`VOLUME COLETIVO`}
                  status={resumoGols.assistencias <= (golsDoTime || 0)}
                />
              </div>
            )}

            {/* Performance Hub */}
            <div className="bg-pt-surface border border-pt-white/10 rounded-[48px] shadow-2xl overflow-hidden relative group">
               <div className="absolute top-0 left-0 w-96 h-96 bg-pt-primary/5 rounded-full blur-[140px] -ml-48 -mt-48 transition-all duration-1000 opacity-60" />

              <div className="p-10 border-b border-pt-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.01] relative z-10">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter drop-shadow-lg">Métricas de Desempenho</h2>
                  <p className="text-[10px] text-pt-text-muted font-black uppercase tracking-[0.3em] italic">Métricas individuais dos onze titulares.</p>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={loading || jogadores.length === 0}
                  className="w-full md:w-auto bg-pt-primary hover:bg-pt-primary/90 disabled:opacity-30 text-pt-bg font-black py-5 px-12 rounded-[24px] flex items-center justify-center gap-4 transition-all transform active:scale-[0.97] shadow-2xl shadow-pt-primary/20 uppercase tracking-[0.15em] text-sm group"
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
                  ) : (
                    <>
                      Validar Avaliações
                      <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-pt-bg/40 text-pt-text-muted text-[10px] font-black uppercase tracking-[0.4em] italic">
                      <th className="px-10 py-8">Unidade Operacional</th>
                      <th className="px-10 py-8 text-center">Protocolo</th>
                      <th className="px-10 py-8 text-center text-pt-primary">Nota</th>
                      <th className="px-10 py-8 text-center">Gols</th>
                      <th className="px-10 py-8 text-center">GC</th>
                      <th className="px-10 py-8 text-center">AST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pt-white/5">
                    {jogadores.map((jogador) => {
                       const dados = performanceData[jogador.id] || {};
                       return (
                        <tr key={jogador.id} className="hover:bg-white/[0.03] transition-all group/row">
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-16 rounded-[22px] bg-pt-bg border border-pt-white/10 flex items-center justify-center text-pt-primary group-hover/row:border-pt-primary/40 group-hover/row:bg-pt-primary/5 transition-all shadow-inner">
                                <UserIcon className="h-7 w-7" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-black text-white text-lg uppercase tracking-tight italic leading-none">{jogador.nome}</div>
                                <div className="text-[10px] text-pt-primary font-black uppercase tracking-[0.2em] opacity-80">{jogador.posicao}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-10 py-8 text-center">
                            <span className="text-[10px] font-black font-mono text-pt-text-muted uppercase opacity-40 italic tracking-widest">#{jogador.id.slice(-6).toUpperCase()}</span>
                          </td>

                          <td className="px-10 py-8">
                            <InputField 
                              value={dados.nota} 
                              onChange={(val) => handleInputChange(jogador.id, "nota", val)}
                              step="0.1"
                              highlight
                            />
                          </td>

                          <td className="px-10 py-8">
                            <InputField 
                              value={dados.gols} 
                              onChange={(val) => handleInputChange(jogador.id, "gols", val)}
                            />
                          </td>

                          <td className="px-10 py-8">
                            <InputField 
                              value={dados.gols_contra} 
                              onChange={(val) => handleInputChange(jogador.id, "gols_contra", val)}
                              color="text-red-500/80"
                            />
                          </td>

                          <td className="px-10 py-8">
                            <InputField 
                              value={dados.assistencias} 
                              onChange={(val) => handleInputChange(jogador.id, "assistencias", val)}
                              color="text-sky-400/80"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {jogadores.length === 0 && (
                  <div className="text-center py-24 px-10">
                    <div className="w-20 h-20 bg-pt-white/5 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-pt-white/10">
                      <Zap className="text-pt-white/5 w-10 h-10" />
                    </div>
                    <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.3em] italic opacity-40">
                      Nenhum titular escalado no radar operacional.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, status = true }) {
  return (
    <div className="bg-pt-surface border border-pt-white/10 rounded-[32px] p-8 relative overflow-hidden group shadow-2xl transition-all hover:border-pt-primary/30">
      <div className={`absolute top-0 right-0 w-2 h-full ${status ? 'bg-pt-primary' : 'bg-red-500'} opacity-20 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center gap-3 text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] mb-4 italic">
        <div className="opacity-40">{icon}</div>
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-4 mb-2">
        <div className="text-5xl font-black text-white tracking-tighter italic">{value}</div>
        {status && <Check className="w-5 h-5 text-pt-primary drop-shadow-[0_0_8px_rgba(162,255,1,0.5)]" />}
      </div>
      <div className="text-[9px] font-black text-pt-text-muted/40 uppercase tracking-[0.2em] mt-2 italic">{sub}</div>
    </div>
  );
}

function InputField({ value, onChange, step = "1", highlight = false, color = "text-white" }) {
  return (
    <div className="w-24 mx-auto relative group/input">
      <input
        type="number"
        step={step}
        min="0"
        max={highlight ? "10" : "99"}
        placeholder="0"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-pt-bg/50 border border-pt-white/10 rounded-[18px] py-4 text-center font-semibold transition-all focus:outline-none focus:border-pt-primary/50 focus:ring-1 focus:ring-pt-primary/30 shadow-inner group-hover/input:bg-pt-bg/80 ${highlight ? 'text-pt-primary text-xl italic font-black' : `${color} text-sm`}`}
      />
    </div>
  );
}