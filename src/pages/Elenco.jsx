import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  AlertCircle,
  X,
  ChevronRight,
  Star,
  TrendingDown,
  Activity,
  Shirt,
  Target,
  Shield,
  Zap,
  Dumbbell,
  AlertTriangle,
} from "lucide-react";
import { getElenco, getDetalheJogador } from "../services/elenco";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const POSICOES = [
  "Goleiro",
  "Zagueiro",
  "Lateral Direito",
  "Lateral Esquerdo",
  "Volante",
  "Meia",
  "Meia-atacante",
  "Atacante",
  "Ponta Direita",
  "Ponta Esquerda",
  "Centroavante",
];

const POSICAO_ABREV = {
  Goleiro: "GL",
  Zagueiro: "ZG",
  "Lateral Direito": "LD",
  "Lateral Esquerdo": "LE",
  Volante: "VL",
  Meia: "ME",
  "Meia-atacante": "MA",
  Atacante: "AT",
  "Ponta Direita": "PD",
  "Ponta Esquerda": "PE",
  Centroavante: "CA",
};

const CATEGORIA_ICONE = {
  Chute: Target,
  Passe: Activity,
  Drible: Zap,
  Defesa: Shield,
  Físico: Dumbbell,
  Disciplina: AlertTriangle,
};

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
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-pt-text-muted">
      <AlertCircle className="w-10 h-10 opacity-30" />
      <p className="font-space text-[11px] font-bold uppercase tracking-[0.2em]">
        {message}
      </p>
    </div>
  );
}

function NotaCircular({ valor, tamanho = "md" }) {
  const radius = tamanho === "lg" ? 36 : 28;
  const stroke = tamanho === "lg" ? 4 : 3;
  const size = (radius + stroke) * 2;
  const circunferencia = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(valor ?? 0, 0), 100);
  const dashOffset = circunferencia - (pct / 100) * circunferencia;

  const cor =
    pct >= 70
      ? "#9ffb00"
      : pct >= 45
      ? "#f59e0b"
      : "#f87171";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={cor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span
        className={`absolute font-sora font-extrabold ${
          tamanho === "lg" ? "text-base" : "text-[11px]"
        }`}
        style={{ color: cor }}
      >
        {Math.round(pct)}
      </span>
    </div>
  );
}

function CategoriaCard({ categoria }) {
  const [expanded, setExpanded] = useState(false);
  const IconeComp = CATEGORIA_ICONE[categoria.categoria] ?? Activity;

  return (
    <div className="border border-pt-border bg-pt-surface-solid">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 p-3 hover:bg-pt-surface-bright/10 transition-colors"
      >
        <div className="text-pt-primary shrink-0">
          <IconeComp className="w-4 h-4" />
        </div>
        <span className="font-space text-[10px] font-bold text-pt-text uppercase tracking-[0.15em] flex-1 text-left">
          {categoria.categoria}
        </span>
        <NotaCircular valor={categoria.nota_geral} tamanho="sm" />
        <ChevronRight
          className={`w-3.5 h-3.5 text-pt-text-muted transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-pt-border/50 px-3 pb-3 pt-2 space-y-2 animate-fade-up">
          {categoria.metricas.map((m) => (
            <div key={m.nome} className="flex items-center gap-2">
              <span className="font-geist text-xs text-pt-text-muted w-40 shrink-0 truncate">
                {m.nome}
              </span>
              <span className="font-sora font-bold text-sm text-pt-white w-12 text-right shrink-0">
                {m.valor % 1 === 0 ? m.valor : m.valor.toFixed(2)}
              </span>
              {m.percentual != null && (
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-pt-primary transition-all duration-700"
                      style={{ width: `${Math.min(m.percentual, 100)}%` }}
                    />
                  </div>
                  <span className="font-space text-[9px] font-bold text-pt-text-muted w-10 text-right shrink-0">
                    {m.percentual.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardJogador({ jogador, onClick }) {
  const abrev =
    POSICAO_ABREV[jogador.posicao_principal] ??
    jogador.posicao_principal?.slice(0, 2).toUpperCase() ??
    "??";

  return (
    <button
      id={`jogador-card-${jogador.id}`}
      onClick={() => onClick(jogador.id)}
      className="group w-full text-left border border-pt-border bg-pt-surface-solid hover:border-pt-primary/60 hover:bg-pt-surface-bright/10 transition-all duration-300 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(159,251,0,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 border border-pt-border bg-pt-surface-bright shrink-0 relative overflow-hidden">
            {jogador.foto_url ? (
              <img
                src={jogador.foto_url}
                alt={jogador.apelido}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-sora font-extrabold text-2xl text-pt-text-muted/30">
                  {(jogador.apelido ?? "?")[0]}
                </span>
              </div>
            )}
            {jogador.numero_camisa != null && (
              <div className="absolute bottom-0 right-0 bg-pt-primary px-1.5 py-0.5">
                <span className="font-sora font-extrabold text-[10px] text-pt-bg leading-none">
                  {jogador.numero_camisa}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-space text-[9px] font-bold text-pt-bg bg-pt-text-muted/30 px-2 py-0.5 uppercase tracking-[0.12em]">
                {abrev}
              </span>
              {jogador.bandeira_url && (
                <img
                  src={jogador.bandeira_url}
                  alt={jogador.nacionalidade ?? ""}
                  className="h-3.5 object-contain opacity-80"
                  title={jogador.nacionalidade}
                />
              )}
            </div>

            <h3 className="font-sora font-extrabold text-base text-pt-white uppercase truncate tracking-tighter group-hover:text-pt-primary transition-colors">
              {jogador.apelido ?? "—"}
            </h3>

            <p className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.15em] mt-0.5">
              {jogador.posicao_principal ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-pt-border/50">
          <div className="flex items-center gap-1.5">
            <Shirt className="w-3 h-3 text-pt-text-muted" />
            <span className="font-geist text-xs text-pt-text-muted">
              {jogador.numero_camisa != null ? `#${jogador.numero_camisa}` : "S/N"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-pt-text-muted group-hover:text-pt-primary transition-colors">
            <span className="font-space text-[9px] font-bold uppercase tracking-[0.15em]">
              Ver detalhes
            </span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </button>
  );
}

function ModalDetalhe({ jogadorId, onClose }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimosJogos, setUltimosJogos] = useState(5);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await getDetalheJogador(jogadorId, ultimosJogos);
      setDados(data);
    } catch (err) {
      setErro(
        err?.response?.data?.detail ?? "Erro ao carregar detalhes do jogador."
      );
    } finally {
      setLoading(false);
    }
  }, [jogadorId, ultimosJogos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative h-full w-full max-w-2xl bg-pt-surface-solid border-l border-pt-border flex flex-col overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do painel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pt-border bg-pt-surface-bright/10 shrink-0">
          <span className="font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.25em]">
            Detalhe do Atleta
          </span>
          <div className="flex items-center gap-3">
            <select
              id="ultimos-jogos-select"
              value={ultimosJogos}
              onChange={(e) => setUltimosJogos(Number(e.target.value))}
              className="bg-pt-surface-solid border border-pt-border text-pt-text pl-2 pr-6 py-1.5 text-xs appearance-none cursor-pointer hover:border-pt-primary/40 focus:outline-none focus:border-pt-primary transition-colors"
            >
              {[3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  Últimos {n} jogos
                </option>
              ))}
            </select>
            <button
              id="modal-fechar"
              onClick={onClose}
              className="p-1.5 text-pt-text-muted hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingSpinner label="Carregando perfil..." />
          ) : erro ? (
            <div className="p-6 flex items-center gap-3 text-red-400 border border-red-500/20 bg-red-500/5 m-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-geist text-sm">{erro}</p>
            </div>
          ) : dados ? (
            <div className="p-6 space-y-6">
              {/* PERFIL */}
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 border border-pt-border bg-pt-surface-bright shrink-0 relative overflow-hidden">
                  {dados.foto_url ? (
                    <img
                      src={dados.foto_url}
                      alt={dados.apelido}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-sora font-extrabold text-4xl text-pt-text-muted/20">
                        {(dados.apelido ?? dados.nome_completo ?? "?")[0]}
                      </span>
                    </div>
                  )}
                  {dados.numero_camisa != null && (
                    <div className="absolute bottom-0 right-0 bg-pt-primary px-2 py-0.5">
                      <span className="font-sora font-extrabold text-xs text-pt-bg">
                        #{dados.numero_camisa}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-sora font-extrabold text-2xl text-pt-white uppercase tracking-tighter truncate">
                    {dados.apelido ?? dados.nome_completo ?? "—"}
                  </h2>
                  {dados.nome_completo && dados.nome_completo !== dados.apelido && (
                    <p className="font-geist text-sm text-pt-text-muted truncate mt-0.5">
                      {dados.nome_completo}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="font-space text-[9px] font-bold text-pt-bg bg-pt-primary px-2 py-0.5 uppercase tracking-[0.12em]">
                      {dados.posicao_principal ?? "—"}
                    </span>
                    {dados.bandeira_url && (
                      <img
                        src={dados.bandeira_url}
                        alt={dados.nacionalidade ?? ""}
                        className="h-4 object-contain"
                        title={dados.nacionalidade}
                      />
                    )}
                    {dados.nacionalidade && (
                      <span className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.1em]">
                        {dados.nacionalidade}
                      </span>
                    )}
                  </div>

                  {dados.posicoes_secundarias?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dados.posicoes_secundarias.map((pos) => (
                        <span
                          key={pos}
                          className="font-space text-[8px] font-bold text-pt-text-muted border border-pt-border px-1.5 py-0.5 uppercase tracking-[0.1em]"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* DADOS FÍSICOS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Idade",
                    value:
                      dados.idade != null ? `${dados.idade} anos` : "—",
                  },
                  {
                    label: "Altura",
                    value:
                      dados.altura_cm != null ? `${dados.altura_cm} cm` : "—",
                  },
                  {
                    label: "Peso",
                    value:
                      dados.peso_kg != null ? `${dados.peso_kg} kg` : "—",
                  },
                  { label: "Perna Dom.", value: dados.perna_boa ?? "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="border border-pt-border bg-pt-surface-bright/5 p-3 flex flex-col gap-1"
                  >
                    <span className="font-space text-[8px] font-bold text-pt-text-muted uppercase tracking-[0.18em]">
                      {label}
                    </span>
                    <span className="font-sora font-bold text-sm text-pt-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* RELATÓRIO DE CARACTERÍSTICAS */}
              {(dados.relatorio?.pontos_fortes?.length > 0 ||
                dados.relatorio?.pontos_fracos?.length > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-pt-primary" />
                    <h3 className="font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.25em]">
                      Relatório de Características
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dados.relatorio.pontos_fortes.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-3.5 h-3.5 text-pt-primary" />
                          <span className="font-space text-[9px] font-bold text-pt-primary uppercase tracking-[0.2em]">
                            Pontos Fortes
                          </span>
                        </div>
                        {dados.relatorio.pontos_fortes.map((p) => (
                          <div
                            key={p.metrica}
                            className="border border-pt-primary/20 bg-pt-primary/5 p-3"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-space text-[9px] font-bold text-pt-primary uppercase tracking-[0.1em] truncate">
                                {p.metrica}
                              </span>
                              <span className="font-sora font-extrabold text-xs text-pt-primary shrink-0 ml-2">
                                {p.valor.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-pt-primary transition-all duration-700"
                                style={{
                                  width: `${Math.min(p.valor, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {dados.relatorio.pontos_fracos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingDown
                            className="w-3.5 h-3.5"
                            style={{ color: "#f87171" }}
                          />
                          <span
                            className="font-space text-[9px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: "#f87171" }}
                          >
                            Pontos Fracos
                          </span>
                        </div>
                        {dados.relatorio.pontos_fracos.map((p) => (
                          <div
                            key={p.metrica}
                            className="border p-3"
                            style={{
                              borderColor: "rgba(248,113,113,0.25)",
                              background: "rgba(248,113,113,0.05)",
                            }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className="font-space text-[9px] font-bold uppercase tracking-[0.1em] truncate"
                                style={{ color: "#f87171" }}
                              >
                                {p.metrica}
                              </span>
                              <span
                                className="font-sora font-extrabold text-xs shrink-0 ml-2"
                                style={{ color: "#f87171" }}
                              >
                                {p.valor.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full transition-all duration-700"
                                style={{
                                  width: `${Math.min(p.valor, 100)}%`,
                                  background: "#f87171",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ESTATÍSTICAS POR CATEGORIA */}
              {dados.categorias_estatisticas?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-pt-secondary" />
                    <h3 className="font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.25em]">
                      Estatísticas — Últimos {ultimosJogos} Jogos
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {dados.categorias_estatisticas.map((cat) => (
                      <div
                        key={cat.categoria}
                        className="flex flex-col items-center gap-1.5 p-2 border border-pt-border bg-pt-surface-bright/5"
                      >
                        <NotaCircular valor={cat.nota_geral} tamanho="sm" />
                        <span className="font-space text-[8px] font-bold text-pt-text-muted uppercase tracking-[0.1em] text-center leading-tight">
                          {cat.categoria}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    {dados.categorias_estatisticas.map((cat) => (
                      <CategoriaCard key={cat.categoria} categoria={cat} />
                    ))}
                  </div>
                </div>
              )}

              {(!dados.categorias_estatisticas ||
                dados.categorias_estatisticas.length === 0) && (
                <div className="p-4 border border-pt-border bg-pt-surface-bright/5 text-center">
                  <p className="font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">
                    Sem estatísticas disponíveis para este período
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Elenco() {
  const [jogadores, setJogadores] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [filtroPosicao, setFiltroPosicao] = useState("");
  const [busca, setBusca] = useState("");

  const [jogadorSelecionadoId, setJogadorSelecionadoId] = useState(null);

  const carregarElenco = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await getElenco({ posicao: filtroPosicao || null });
      setJogadores(data.jogadores ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setErro(err?.response?.data?.detail ?? "Erro ao carregar elenco.");
    } finally {
      setLoading(false);
    }
  }, [filtroPosicao]);

  useEffect(() => {
    carregarElenco();
  }, [carregarElenco]);

  const jogadoresFiltrados = jogadores.filter((j) => {
    const nome = (j.apelido ?? "").toLowerCase();
    return nome.includes(busca.toLowerCase());
  });

  return (
    <div className="animate-fade-up font-sans text-pt-text">
      {/* HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-sora font-extrabold uppercase tracking-tighter text-pt-white">
            Elenco <span className="text-pt-primary">Completo</span>
          </h1>
          <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mt-2">
            {total > 0
              ? `${total} atleta${total > 1 ? "s" : ""} cadastrado${
                  total > 1 ? "s" : ""
                }`
              : "Comissão Técnica — Visualização do Elenco"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Busca */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted pointer-events-none" />
            <input
              id="busca-jogador"
              type="text"
              placeholder="BUSCAR ATLETA..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-44 bg-pt-surface-solid border-b border-pt-border pl-9 pr-4 py-2 text-pt-white focus:outline-none focus:border-pt-primary transition-colors"
            />
          </div>

          {/* Filtro posição */}
          <div className="relative">
            <select
              id="filtro-posicao"
              value={filtroPosicao}
              onChange={(e) => setFiltroPosicao(e.target.value)}
              className="bg-pt-surface-solid border border-pt-border text-pt-text pl-3 pr-8 py-2 appearance-none cursor-pointer hover:border-pt-primary/40 focus:outline-none focus:border-pt-primary transition-colors"
            >
              <option value="">TODAS AS POSIÇÕES</option>
              {POSICOES.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
            <Users className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-pt-text-muted pointer-events-none" />
          </div>
        </div>
      </header>

      {/* ERRO */}
      {erro && (
        <div className="mb-6 flex items-center gap-3 p-4 border border-red-500/30 bg-red-500/10 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-geist text-sm">{erro}</p>
        </div>
      )}

      {/* FILTRO ATIVO BADGE */}
      {filtroPosicao && (
        <div className="mb-5 flex items-center gap-2">
          <span className="font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.15em]">
            Filtro ativo:
          </span>
          <button
            onClick={() => setFiltroPosicao("")}
            className="flex items-center gap-1.5 font-space text-[9px] font-bold text-pt-primary border border-pt-primary/30 bg-pt-primary/10 px-2 py-1 uppercase tracking-[0.12em] hover:bg-pt-primary/20 transition-colors"
          >
            {filtroPosicao}
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* CONTEÚDO */}
      {loading ? (
        <LoadingSpinner label="Carregando elenco..." />
      ) : jogadoresFiltrados.length === 0 ? (
        <EmptyState
          message={
            busca || filtroPosicao
              ? "Nenhum atleta encontrado com os filtros aplicados."
              : "Nenhum atleta cadastrado no elenco."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jogadoresFiltrados.map((jogador, i) => (
              <div
                key={jogador.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
              >
                <CardJogador
                  jogador={jogador}
                  onClick={setJogadorSelecionadoId}
                />
              </div>
            ))}
          </div>

          <p className="mt-6 font-space text-[9px] font-bold text-pt-text-muted uppercase tracking-[0.15em]">
            {jogadoresFiltrados.length} atleta
            {jogadoresFiltrados.length > 1 ? "s" : ""} exibido
            {jogadoresFiltrados.length > 1 ? "s" : ""}
            {busca && ` · busca: "${busca}"`}
            {filtroPosicao && ` · posição: ${filtroPosicao}`}
          </p>
        </>
      )}

      {/* MODAL DE DETALHE */}
      {jogadorSelecionadoId != null && (
        <ModalDetalhe
          jogadorId={jogadorSelecionadoId}
          onClose={() => setJogadorSelecionadoId(null)}
        />
      )}
    </div>
  );
}
