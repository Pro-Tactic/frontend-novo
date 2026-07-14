import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ChevronDown,
  TrendingUp,
  Users,
  Target,
  Zap,
  Activity,
  Search,
  AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import {
  getMeuTimeUltimosJogos,
  getTimeUltimosJogos,
  getJogadoresDoTime,
} from "../services/clubes";

// ---------------------------------------------------------------------------
// Constantes de labels das estatísticas de jogadores
// ---------------------------------------------------------------------------

const STATS_LABELS = {
  jogos:                   "Jogos",
  passes_totais:           "Passes Totais",
  passes_certos:           "Passes Certos",
  acoes_bola:              "Ações c/ Bola",
  perdas_posse:            "Perda de Posse",
  bola_longa_totais:       "Bola Longa Total",
  bola_longa_certas:       "Bola Longa Certas",
  passes_chave:            "Passe Chave",
  total_cortes:            "Total de Cortes",
  interceptacoes:          "Interceptações",
  interceptacao:           "Interceptação",
  bloqueio_linha:          "Bloqueio Linha de Passe",
  desarmes_totais:         "Desarmes Totais",
  desarmes_vencidos:       "Desarmes Vencidos",
  bolas_recuperadas:       "Bolas Recuperadas",
  duelos_totais:           "Duelos Totais",
  duelos_vencidos:         "Duelos Vencidos",
  duelos_aereos_totais:    "Duelos Aéreos Totais",
  duelos_aereos_vencidos:  "Duelos Aéreos Vencidos",
  total_chutes:            "Total de Chutes",
  chute_alvo:              "Chute ao Alvo",
  chute_fora:              "Chute de Fora",
  chutes_bloqueado:        "Chutes Bloqueados",
  grande_chance_criada:    "Grande Chance Criada",
  grande_chance_perdida:   "Grande Chance Perdida",
  erro_gerou_chute:        "Erro que Gerou Chute",
  xG:                      "xG",
  xA:                      "xA",
  cruzamentos_totais:      "Cruzamentos Totais",
  cruzamentos_certos:      "Cruzamentos Certos",
  impedimentos:            "Impedimentos",
  faltas_sofridas:         "Faltas Sofridas",
  faltas_cometidas:        "Faltas Cometidas",
  dominios_errados:        "Domínios Errados",
};

const STATS_FLOAT = new Set(["xG", "xA"]);

// ---------------------------------------------------------------------------
// Helpers de formatação
// ---------------------------------------------------------------------------

function fmt(value, campo) {
  if (value === null || value === undefined) return "—";
  if (STATS_FLOAT.has(campo)) return Number(value).toFixed(2);
  return value;
}

function fmtPosse(v) {
  if (v === null || v === undefined) return "—";
  return `${Number(v).toFixed(0)}%`;
}

function fmtData(dataHora) {
  if (!dataHora) return "—";
  return new Date(dataHora).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function LoadingSpinner({ label = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin" />
      <p className="font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.3em] animate-pulse">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-pt-text-muted">
      <AlertCircle className="w-10 h-10 opacity-30" />
      <p className="font-space text-[11px] font-bold uppercase tracking-[0.2em]">{message}</p>
    </div>
  );
}

function StatBar({ label, mandante, visitante, highlight = false }) {
  const total = (mandante ?? 0) + (visitante ?? 0);
  const pct = total > 0 ? ((mandante ?? 0) / total) * 100 : 50;

  return (
    <div className={`px-4 py-3 ${highlight ? "bg-pt-surface-bright/10" : ""}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-sora font-bold text-sm text-pt-primary">
          {mandante !== null && mandante !== undefined ? mandante : "—"}
        </span>
        <span className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.15em]">
          {label}
        </span>
        <span className="font-sora font-bold text-sm text-pt-secondary">
          {visitante !== null && visitante !== undefined ? visitante : "—"}
        </span>
      </div>
      <div className="flex h-1.5 w-full overflow-hidden bg-pt-border rounded-none">
        <div
          className="h-full bg-pt-primary transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
        <div
          className="h-full bg-pt-secondary transition-all duration-700"
          style={{ width: `${100 - pct}%` }}
        />
      </div>
    </div>
  );
}

function PartidaCard({ partida, isHome }) {
  const [expanded, setExpanded] = useState(false);
  const { time_mandante, time_visitante, competicao, estatisticas } = partida;
  const meuTime = isHome ? time_mandante : time_visitante;
  const adversario = isHome ? time_visitante : time_mandante;

  return (
    <div className="border border-pt-border bg-pt-surface-solid transition-all">
      {/* Header da Partida */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-pt-surface-bright/10 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {/* Competição */}
        <div className="hidden md:flex items-center gap-2 w-36 shrink-0">
          {competicao?.foto_liga ? (
            <img src={competicao.foto_liga} alt={competicao.nome_liga} className="w-5 h-5 object-contain opacity-80" />
          ) : (
            <Shield className="w-4 h-4 text-pt-text-muted" />
          )}
          <span className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.1em] truncate">
            {competicao?.nome_liga ?? "—"}
          </span>
        </div>

        {/* Times + Placar */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 justify-end min-w-0 flex-1">
            {time_mandante?.foto_clube && (
              <img src={time_mandante.foto_clube} alt={time_mandante.nome_clube} className="w-7 h-7 object-contain" />
            )}
            <span className="font-sora font-bold text-sm text-pt-white uppercase truncate">
              {time_mandante?.nome_clube ?? "—"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-sora font-extrabold text-xl text-pt-white w-8 text-center">
              {partida.placar_mandante ?? "—"}
            </span>
            <span className="font-space text-[10px] font-bold text-pt-text-muted">×</span>
            <span className="font-sora font-extrabold text-xl text-pt-white w-8 text-center">
              {partida.placar_visitante ?? "—"}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-start min-w-0 flex-1">
            <span className="font-sora font-bold text-sm text-pt-white uppercase truncate">
              {time_visitante?.nome_clube ?? "—"}
            </span>
            {time_visitante?.foto_clube && (
              <img src={time_visitante.foto_clube} alt={time_visitante.nome_clube} className="w-7 h-7 object-contain" />
            )}
          </div>
        </div>

        {/* Data + Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-geist text-xs text-pt-text-muted">{fmtData(partida.data_hora_partida)}</span>
          <ChevronDown
            className={`w-4 h-4 text-pt-text-muted transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Estatísticas expandidas */}
      {expanded && estatisticas && (
        <div className="border-t border-pt-border animate-fade-up">
          {/* Cabeçalho dos times */}
          <div className="flex justify-between px-4 py-2 bg-pt-surface-bright/5 border-b border-pt-border">
            <div className="flex items-center gap-2">
              {time_mandante?.foto_clube && (
                <img src={time_mandante.foto_clube} alt="" className="w-5 h-5 object-contain" />
              )}
              <span className="font-space text-[10px] font-bold text-pt-primary uppercase tracking-[0.1em]">
                {time_mandante?.nome_clube ?? "Mandante"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-space text-[10px] font-bold text-pt-secondary uppercase tracking-[0.1em]">
                {time_visitante?.nome_clube ?? "Visitante"}
              </span>
              {time_visitante?.foto_clube && (
                <img src={time_visitante.foto_clube} alt="" className="w-5 h-5 object-contain" />
              )}
            </div>
          </div>

          <div className="divide-y divide-pt-border/50">
            <StatBar label="Posse de Bola" mandante={estatisticas.posse_mandante !== null ? `${Number(estatisticas.posse_mandante).toFixed(0)}%` : null} visitante={estatisticas.posse_visitante !== null ? `${Number(estatisticas.posse_visitante).toFixed(0)}%` : null} highlight />
            <StatBar label="Passes" mandante={estatisticas.passes_mandante} visitante={estatisticas.passes_visitante} />
            <StatBar label="Finalizações" mandante={estatisticas.finalizacoes_mandante} visitante={estatisticas.finalizacoes_visitante} highlight />
            <StatBar label="xG" mandante={estatisticas.xg_mandante !== null ? Number(estatisticas.xg_mandante).toFixed(2) : null} visitante={estatisticas.xg_visitante !== null ? Number(estatisticas.xg_visitante).toFixed(2) : null} />
            <StatBar label="xA" mandante={estatisticas.xa_mandante !== null ? Number(estatisticas.xa_mandante).toFixed(2) : null} visitante={estatisticas.xa_visitante !== null ? Number(estatisticas.xa_visitante).toFixed(2) : null} highlight />
            <StatBar label="Escanteios" mandante={estatisticas.escanteios_mandante} visitante={estatisticas.escanteios_visitantes} />
            <StatBar label="Impedimentos" mandante={estatisticas.impedimentos_mandante} visitante={estatisticas.impedimentos_visitante} highlight />
            <StatBar label="Laterais" mandante={estatisticas.laterais_mandante} visitante={estatisticas.laterais_visitante} />
          </div>
        </div>
      )}
    </div>
  );
}

function JogadorRow({ jogador, colunas }) {
  const { estatisticas } = jogador;
  return (
    <tr className="border-b border-pt-border hover:bg-pt-surface-bright/10 transition-colors group">
      <td className="p-3 sticky left-0 bg-pt-surface-solid group-hover:bg-pt-surface-bright/10 z-10 min-w-[180px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pt-surface-bright border border-pt-border flex items-center justify-center shrink-0 overflow-hidden">
            {jogador.foto_url ? (
              <img src={jogador.foto_url} alt={jogador.apelido} className="w-full h-full object-cover" />
            ) : (
              <span className="font-sora font-extrabold text-[10px] text-pt-text-muted">
                {jogador.numero_camisa_clube ?? "?"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-sora font-bold text-[13px] text-pt-white uppercase truncate">
              {jogador.apelido || jogador.nome_completo || "—"}
            </div>
            <div className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.1em] truncate">
              {jogador.posicao_principal ?? "—"}
            </div>
          </div>
        </div>
      </td>
      {colunas.map((campo) => (
        <td key={campo} className="p-3 text-center font-geist text-sm text-pt-text">
          {fmt(estatisticas?.[campo], campo)}
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

const ABAS = [
  { id: "meu-time", label: "Meu Time", icon: <Shield className="w-4 h-4" /> },
  { id: "adversario", label: "Time Adversário", icon: <Target className="w-4 h-4" /> },
  { id: "jogadores", label: "Jogadores", icon: <Users className="w-4 h-4" /> },
];

const LIMITES = [3, 5, 10, 20];

const COLUNAS_JOGADORES = Object.keys(STATS_LABELS);

export default function Clubes() {
  const [abaAtiva, setAbaAtiva] = useState("meu-time");

  // Filtros globais
  const [ligaId, setLigaId] = useState(null);
  const [limite, setLimite] = useState(5);
  const [ligas, setLigas] = useState([]);
  const [minhasLigas, setMinhasLigas] = useState([]);

  // Adversário
  const [times, setTimes] = useState([]);
  const [timeSelecionadoId, setTimeSelecionadoId] = useState(null);
  const [buscaTime, setBuscaTime] = useState("");

  // Dados
  const [jogosDoTime, setJogosDoTime] = useState([]);
  const [jogosAdversario, setJogosAdversario] = useState([]);
  const [jogadores, setJogadores] = useState([]);

  // Estados de loading / erro
  const [loadingJogos, setLoadingJogos] = useState(false);
  const [loadingAdversario, setLoadingAdversario] = useState(false);
  const [loadingJogadores, setLoadingJogadores] = useState(false);
  const [erro, setErro] = useState(null);

  // Busca na tabela de jogadores
  const [buscaJogador, setBuscaJogador] = useState("");

  // ---------------------------------------------------------------------------
  // Carregamento inicial: ligas e times disponíveis
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function carregarMetadados() {
      try {
        const [resLigas, resTimes, resMinhasLigas] = await Promise.all([
          api.get("/api/v1/ligas/"),
          api.get("/api/v1/times/"),
          api.get("/api/v1/ligas/meus-clubes").catch(() => ({ data: [] }))
        ]);
        setLigas(Array.isArray(resLigas.data) ? resLigas.data : []);
        setTimes(Array.isArray(resTimes.data) ? resTimes.data : []);
        setMinhasLigas(Array.isArray(resMinhasLigas.data) ? resMinhasLigas.data : []);
      } catch {
        // silencia — não é crítico para exibição
      }
    }
    carregarMetadados();
  }, []);

  // ---------------------------------------------------------------------------
  // Aba "Meu Time"
  // ---------------------------------------------------------------------------

  const carregarJogosDoTime = useCallback(async () => {
    setLoadingJogos(true);
    setErro(null);
    try {
      const dados = await getMeuTimeUltimosJogos({ ligaId, limite });
      setJogosDoTime(dados);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Erro ao carregar dados do seu time.";
      setErro(msg);
    } finally {
      setLoadingJogos(false);
    }
  }, [ligaId, limite]);

  useEffect(() => {
    if (abaAtiva === "meu-time") carregarJogosDoTime();
  }, [abaAtiva, carregarJogosDoTime]);

  // ---------------------------------------------------------------------------
  // Aba "Adversário"
  // ---------------------------------------------------------------------------

  const carregarJogosAdversario = useCallback(async () => {
    if (!timeSelecionadoId) return;
    setLoadingAdversario(true);
    setErro(null);
    try {
      const dados = await getTimeUltimosJogos(timeSelecionadoId, { ligaId, limite });
      setJogosAdversario(dados);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Erro ao carregar dados do adversário.";
      setErro(msg);
    } finally {
      setLoadingAdversario(false);
    }
  }, [timeSelecionadoId, ligaId, limite]);

  useEffect(() => {
    if (abaAtiva === "adversario") carregarJogosAdversario();
  }, [abaAtiva, carregarJogosAdversario]);

  // ---------------------------------------------------------------------------
  // Aba "Jogadores"
  // ---------------------------------------------------------------------------

  const carregarJogadores = useCallback(async () => {
    if (!timeSelecionadoId) return;
    setLoadingJogadores(true);
    setErro(null);
    try {
      const dados = await getJogadoresDoTime(timeSelecionadoId, { ligaId, limite });
      setJogadores(dados);
    } catch (err) {
      const msg = err?.response?.data?.detail ?? "Erro ao carregar jogadores.";
      setErro(msg);
    } finally {
      setLoadingJogadores(false);
    }
  }, [timeSelecionadoId, ligaId, limite]);

  useEffect(() => {
    if (abaAtiva === "jogadores") carregarJogadores();
  }, [abaAtiva, carregarJogadores]);

  // ---------------------------------------------------------------------------
  // Derivados
  // ---------------------------------------------------------------------------

  const timesFiltrados = times.filter((t) =>
    (t.nome_clube ?? "").toLowerCase().includes(buscaTime.toLowerCase())
  );

  const jogadoresFiltrados = jogadores.filter((j) => {
    const nome = (j.apelido || j.nome_completo || "").toLowerCase();
    return nome.includes(buscaJogador.toLowerCase());
  });

  const timeSelecionado = times.find((t) => t.id === timeSelecionadoId);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="animate-fade-up font-sans text-pt-text">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-sora font-extrabold uppercase tracking-tighter text-pt-white">
            Análise de <span className="text-pt-primary">Clubes</span>
          </h1>
          <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mt-2">
            Dados de Desempenho — Últimas Partidas e Jogadores
          </p>
        </div>

        {/* Filtros globais */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Liga */}
          <div className="relative">
            <select
              id="filtro-liga"
              value={ligaId ?? ""}
              onChange={(e) => setLigaId(e.target.value ? Number(e.target.value) : null)}
              className="bg-pt-surface-solid border border-pt-border text-pt-text pl-3 pr-8 py-2 appearance-none cursor-pointer hover:border-pt-primary/40 focus:outline-none focus:border-pt-primary transition-colors"
            >
              <option value="">TODAS AS LIGAS</option>
              {(abaAtiva === "meu-time" ? minhasLigas : ligas).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome_liga}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-pt-text-muted pointer-events-none" />
          </div>

          {/* Filtro Limite */}
          <div className="relative">
            <select
              id="filtro-limite"
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="bg-pt-surface-solid border border-pt-border text-pt-text pl-3 pr-8 py-2 appearance-none cursor-pointer hover:border-pt-primary/40 focus:outline-none focus:border-pt-primary transition-colors"
            >
              {LIMITES.map((n) => (
                <option key={n} value={n}>
                  ÚLTIMOS {n} JOGOS
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-pt-text-muted pointer-events-none" />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* SELEÇÃO DE TIME ADVERSÁRIO (abas adversário/jogadores)              */}
      {/* ------------------------------------------------------------------ */}
      {(abaAtiva === "adversario" || abaAtiva === "jogadores") && (
        <div className="mb-6 p-4 border border-pt-border bg-pt-surface-solid animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-pt-primary" />
            <span className="font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">
              Selecionar Time
            </span>
            {timeSelecionado && (
              <span className="font-sora font-bold text-sm text-pt-primary ml-2">
                — {timeSelecionado.nome_clube}
              </span>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted" />
            <input
              id="busca-time"
              type="text"
              placeholder="BUSCAR TIME..."
              value={buscaTime}
              onChange={(e) => setBuscaTime(e.target.value)}
              className="w-full md:w-64 bg-pt-surface-solid border-b border-pt-border pl-10 pr-4 py-2 text-pt-white focus:outline-none focus:border-pt-primary transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
            {timesFiltrados.map((t) => (
              <button
                key={t.id}
                id={`time-btn-${t.id}`}
                onClick={() => setTimeSelecionadoId(t.id)}
                className={`flex items-center gap-2 px-3 py-1.5 border text-left transition-all ${
                  timeSelecionadoId === t.id
                    ? "border-pt-primary bg-pt-primary/10 text-pt-primary shadow-glow-primary"
                    : "border-pt-border bg-pt-surface-solid text-pt-text-muted hover:border-pt-primary/40 hover:text-pt-text"
                }`}
              >
                {t.foto_clube && (
                  <img src={t.foto_clube} alt={t.nome_clube} className="w-5 h-5 object-contain" />
                )}
                <span className="font-space text-[10px] font-bold uppercase tracking-[0.1em]">
                  {t.nome_clube}
                </span>
              </button>
            ))}
            {timesFiltrados.length === 0 && (
              <span className="font-geist text-sm text-pt-text-muted">Nenhum time encontrado.</span>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ABAS                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex border-b border-pt-border mb-6 gap-0">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            id={`aba-${aba.id}`}
            onClick={() => {
              setAbaAtiva(aba.id);
              setLigaId(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-space text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              abaAtiva === aba.id
                ? "border-pt-primary text-pt-primary"
                : "border-transparent text-pt-text-muted hover:text-pt-text"
            }`}
          >
            {aba.icon}
            {aba.label}
          </button>
        ))}
      </div>

      {/* Erro global */}
      {erro && (
        <div className="mb-6 flex items-center gap-3 p-4 border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-geist text-sm">{erro}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ABA: MEU TIME                                                        */}
      {/* ------------------------------------------------------------------ */}
      {abaAtiva === "meu-time" && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-pt-primary" />
            <h2 className="font-space text-[11px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">
              Últimos {limite} Jogos — Meu Time
            </h2>
          </div>

          {loadingJogos ? (
            <LoadingSpinner label="Buscando partidas..." />
          ) : jogosDoTime.length === 0 ? (
            <EmptyState message="Nenhuma partida encontrada para o seu time." />
          ) : (
            <div className="space-y-2">
              {jogosDoTime.map((partida) => (
                <PartidaCard key={partida.id} partida={partida} isHome />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ABA: ADVERSÁRIO                                                      */}
      {/* ------------------------------------------------------------------ */}
      {abaAtiva === "adversario" && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-pt-primary" />
            <h2 className="font-space text-[11px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">
              Últimos {limite} Jogos — Time Adversário
            </h2>
          </div>

          {!timeSelecionadoId ? (
            <EmptyState message="Selecione um time adversário acima para visualizar os dados." />
          ) : loadingAdversario ? (
            <LoadingSpinner label="Buscando partidas do adversário..." />
          ) : jogosAdversario.length === 0 ? (
            <EmptyState message="Nenhuma partida encontrada para o time selecionado." />
          ) : (
            <div className="space-y-2">
              {jogosAdversario.map((partida) => (
                <PartidaCard key={partida.id} partida={partida} isHome={false} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ABA: JOGADORES                                                       */}
      {/* ------------------------------------------------------------------ */}
      {abaAtiva === "jogadores" && (
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pt-primary" />
              <h2 className="font-space text-[11px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">
                Jogadores {timeSelecionado ? `— ${timeSelecionado.nome_clube}` : ""}
              </h2>
            </div>

            {/* Busca por nome */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted" />
              <input
                id="busca-jogador"
                type="text"
                placeholder="BUSCAR JOGADOR..."
                value={buscaJogador}
                onChange={(e) => setBuscaJogador(e.target.value)}
                className="w-full md:w-56 bg-pt-surface-solid border-b border-pt-border pl-10 pr-4 py-2 text-pt-white focus:outline-none focus:border-pt-primary transition-colors"
              />
            </div>
          </div>

          {!timeSelecionadoId ? (
            <EmptyState message="Selecione um clube acima para visualizar os jogadores." />
          ) : loadingJogadores ? (
            <LoadingSpinner label="Carregando jogadores..." />
          ) : jogadoresFiltrados.length === 0 ? (
            <EmptyState message="Nenhum jogador encontrado." />
          ) : (
            <div className="overflow-x-auto border border-pt-border">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-pt-surface-bright/20 border-b border-pt-border">
                    <th className="p-3 sticky left-0 bg-pt-surface-solid z-10 min-w-[180px]">
                      <span className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">
                        Jogador
                      </span>
                    </th>
                    {COLUNAS_JOGADORES.map((campo) => (
                      <th key={campo} className="p-3 min-w-[90px] text-center whitespace-nowrap">
                        <span className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.15em]">
                          {STATS_LABELS[campo]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-pt-border">
                  {jogadoresFiltrados.map((jogador) => (
                    <JogadorRow
                      key={jogador.id}
                      jogador={jogador}
                      colunas={COLUNAS_JOGADORES}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legenda de registros */}
          {jogadoresFiltrados.length > 0 && (
            <p className="mt-3 font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.15em]">
              {jogadoresFiltrados.length} jogador(es) · stats acumuladas nos últimos {limite} jogos
            </p>
          )}
        </section>
      )}
    </div>
  );
}
