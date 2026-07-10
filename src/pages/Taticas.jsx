import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { getUserType } from "../services/auth";
import {
  obterTatica,
  atualizarPosicaoJogador,
  criarRelatorioTatico,
  listarRelatoriosTaticos,
  atualizarRelatorioTatico,
} from "../services/taticas";
import {
  ArrowLeft,
  Brain,
  Shield,
  Swords,
  Target,
  X,
  ChevronRight,
  AlertTriangle,
  Check,
  FileText,
  Image,
  Save,
  Plus,
  Edit3,
  User,
  Crosshair,
} from "lucide-react";

// ─── Constantes ─────────────────────────────────────────────────────
const FASES = [
  { key: "padrao", label: "PADRÃO", icon: <Target className="w-4 h-4" /> },
  { key: "ofensiva", label: "OFENSIVA", icon: <Swords className="w-4 h-4" /> },
  { key: "defensiva", label: "DEFENSIVA", icon: <Shield className="w-4 h-4" /> },
];

export default function Taticas() {
  const { partidaId } = useParams();
  const navigate = useNavigate();
  const userType = getUserType();
  const isComissao = userType === "COMISSAO";
  const isAnalista = userType === "ANALISTA";

  // ─── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [partida, setPartida] = useState(null);
  const [faseAtiva, setFaseAtiva] = useState("padrao");
  const [tatica, setTatica] = useState(null);

  // Modal jogador
  const [jogadorModal, setJogadorModal] = useState(null);

  // Drag (CT only)
  const svgRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  // Relatório (AD only)
  const [relatorios, setRelatorios] = useState([]);
  const [relatorioTexto, setRelatorioTexto] = useState("");
  const [relatorioImagens, setRelatorioImagens] = useState("");
  const [editandoRelatorio, setEditandoRelatorio] = useState(null);
  const [salvandoRelatorio, setSalvandoRelatorio] = useState(false);
  const [relatorioSucesso, setRelatorioSucesso] = useState(false);

  // ─── Load Data ──────────────────────────────────────────────────
  const carregarTatica = useCallback(async () => {
    try {
      const data = await obterTatica(partidaId);
      setTatica(data);
    } catch (err) {
      console.error("Erro ao carregar tática:", err);
    }
  }, [partidaId]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [partidaRes] = await Promise.all([
          api.get(`/api/v1/partidas/${partidaId}`),
        ]);
        setPartida(partidaRes.data);
        await carregarTatica();

        if (isAnalista) {
          const rels = await listarRelatoriosTaticos(partidaId);
          setRelatorios(Array.isArray(rels) ? rels : []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [partidaId, carregarTatica, isAnalista]);

  // ─── Filtra escalação por fase ──────────────────────────────────
  const filtrarPorFase = (escalacao) => {
    if (!escalacao) return [];
    return escalacao.filter(
      (e) => !e.tipo_escalacao || e.tipo_escalacao === faseAtiva
    );
  };

  const escalacaoPropria = filtrarPorFase(tatica?.escalacao_propria);
  const escalacaoAdversario = filtrarPorFase(tatica?.escalacao_adversario);

  const titularesProprios = escalacaoPropria.filter(
    (e) => e.status_escalacao === "titular"
  );
  const reservasProprios = escalacaoPropria.filter(
    (e) => e.status_escalacao === "reserva"
  );
  const titularesAdversario = escalacaoAdversario.filter(
    (e) => e.status_escalacao === "titular"
  );

  // ─── Drag & Drop (CT only) ──────────────────────────────────────
  const handlePointerDown = (e, jogadorId) => {
    if (!isComissao) return;
    e.target.setPointerCapture(e.pointerId);
    setDraggingId(jogadorId);
  };

  const handlePointerMove = (e) => {
    if (!draggingId || !isComissao) return;
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());

    let cx = Math.max(20, Math.min(580, cursorPt.x));
    let cy = Math.max(20, Math.min(780, cursorPt.y));

    setTatica((prev) => {
      if (!prev) return prev;
      const updated = prev.escalacao_propria.map((e) =>
        e.id_jogador === draggingId
          ? { ...e, coord_x: cx / 600, coord_y: cy / 800 }
          : e
      );
      return { ...prev, escalacao_propria: updated };
    });
  };

  const handlePointerUp = async () => {
    if (!draggingId || !isComissao) return;
    const jogador = tatica?.escalacao_propria.find(
      (e) => e.id_jogador === draggingId
    );
    setDraggingId(null);

    if (jogador) {
      try {
        await atualizarPosicaoJogador(partidaId, jogador.id_jogador, {
          coord_x: jogador.coord_x,
          coord_y: jogador.coord_y,
          status_escalacao: jogador.status_escalacao,
          tipo_escalacao: jogador.tipo_escalacao || faseAtiva,
        });
        // Re-fetch para atualizar insights
        await carregarTatica();
      } catch (err) {
        console.error("Erro ao atualizar posição:", err);
      }
    }
  };

  // ─── Double click modal ─────────────────────────────────────────
  const handleDoubleClick = (jogador) => {
    if (jogador?.jogador) {
      setJogadorModal(jogador.jogador);
    }
  };

  // ─── Relatório (AD only) ────────────────────────────────────────
  const handleSalvarRelatorio = async () => {
    if (!relatorioTexto.trim()) return;
    setSalvandoRelatorio(true);
    try {
      const imagensArray = relatorioImagens
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0);

      if (editandoRelatorio) {
        await atualizarRelatorioTatico(partidaId, editandoRelatorio.id, {
          conteudo_texto: relatorioTexto,
          imagens_urls: imagensArray,
        });
      } else {
        await criarRelatorioTatico(partidaId, {
          conteudo_texto: relatorioTexto,
          imagens_urls: imagensArray,
        });
      }

      const rels = await listarRelatoriosTaticos(partidaId);
      setRelatorios(Array.isArray(rels) ? rels : []);
      setRelatorioTexto("");
      setRelatorioImagens("");
      setEditandoRelatorio(null);
      setRelatorioSucesso(true);
      setTimeout(() => setRelatorioSucesso(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar relatório:", err);
    } finally {
      setSalvandoRelatorio(false);
    }
  };

  const handleEditarRelatorio = (rel) => {
    setEditandoRelatorio(rel);
    setRelatorioTexto(rel.conteudo_texto);
    setRelatorioImagens((rel.imagens_urls || []).join("\n"));
  };

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-text-muted font-space font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">
          Carregando Tática...
        </p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up font-sans text-pt-text">
      {/* ── Header ── */}
      <header className="mb-6">
        <button
          onClick={() => navigate("/partidas")}
          className="flex items-center gap-2 text-pt-text-muted hover:text-pt-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-space text-[10px] font-bold uppercase tracking-[0.2em]">
            Voltar ao Calendário
          </span>
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-sora font-extrabold uppercase tracking-tighter">
              Painel <span className="text-pt-primary">Tático</span>
            </h1>
            {partida && (
              <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mt-1">
                {partida.time_mandante?.nome_clube || "Mandante"} vs{" "}
                {partida.time_visitante?.nome_clube || "Visitante"} —{" "}
                {partida.data_hora_partida
                  ? new Date(partida.data_hora_partida).toLocaleDateString("pt-BR")
                  : "--"}
                {partida.competicao && ` — ${partida.competicao.nome_liga}`}
              </p>
            )}
          </div>

          {/* Seletor de Fase */}
          <div className="flex gap-1">
            {FASES.map((fase) => (
              <button
                key={fase.key}
                onClick={() => setFaseAtiva(fase.key)}
                className={`flex items-center gap-2 px-4 py-2.5 border font-space text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                  faseAtiva === fase.key
                    ? "bg-pt-primary text-pt-bg border-pt-primary shadow-glow-primary"
                    : "bg-pt-surface-solid text-pt-text-muted border-pt-border hover:border-pt-primary/50 hover:text-pt-text"
                }`}
              >
                {fase.icon}
                {fase.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content Grid ── */}
      <div className="flex gap-6" style={{ minHeight: "calc(100vh - 280px)" }}>
        {/* ── Campo Tático (centro) ── */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-pt-surface-solid border border-pt-border relative flex-1 flex flex-col overflow-hidden">
            {/* Label formação */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-pt-bg/90 border border-pt-border px-5 py-2 backdrop-blur-sm">
              <span className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.2em] block text-center">
                {isComissao ? "Arraste para reposicionar" : "Visualização da Escalação"}
              </span>
              {tatica?.insight && (
                <span className="font-sora text-lg font-extrabold text-pt-primary block text-center">
                  {tatica.insight.formacao_detectada}
                </span>
              )}
            </div>

            {/* SVG do campo — Time Próprio */}
            <div className="flex-1 flex items-center justify-center p-4">
              <svg
                ref={svgRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-full max-h-[700px]"
                viewBox="0 0 600 800"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Campo */}
                <defs>
                  <linearGradient id="fieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a3a0a" />
                    <stop offset="50%" stopColor="#1f4a10" />
                    <stop offset="100%" stopColor="#1a3a0a" />
                  </linearGradient>
                </defs>
                <rect x="20" y="20" width="560" height="760" fill="url(#fieldGradient)" rx="4" />

                {/* Linhas do campo */}
                <g className="stroke-white/20 stroke-[1.5] fill-none pointer-events-none">
                  <rect x="20" y="20" width="560" height="760" />
                  <line x1="20" y1="400" x2="580" y2="400" />
                  <circle cx="300" cy="400" r="60" />
                  <circle cx="300" cy="400" r="3" fill="rgba(255,255,255,0.3)" />
                  {/* Área superior (adversário) */}
                  <rect x="150" y="20" width="300" height="120" />
                  <rect x="220" y="20" width="160" height="40" />
                  <path d="M 230 140 Q 300 180 370 140" />
                  {/* Área inferior (próprio) */}
                  <rect x="150" y="660" width="300" height="120" />
                  <rect x="220" y="740" width="160" height="40" />
                  <path d="M 230 660 Q 300 620 370 660" />
                  {/* Cantos */}
                  <path d="M 20 30 Q 30 20 40 20" />
                  <path d="M 560 20 Q 580 20 580 40" />
                  <path d="M 20 770 Q 20 780 40 780" />
                  <path d="M 560 780 Q 580 780 580 760" />
                </g>

                {/* Marcação meio-campo */}
                <text
                  x="50"
                  y="395"
                  className="font-space text-[8px] fill-white/10 uppercase tracking-[0.3em] pointer-events-none"
                >
                  Adversário
                </text>
                <text
                  x="50"
                  y="415"
                  className="font-space text-[8px] fill-white/10 uppercase tracking-[0.3em] pointer-events-none"
                >
                  Seu Time
                </text>

                {/* Jogadores adversários (metade de cima) */}
                {titularesAdversario.map((e) => {
                  const cx = (e.coord_x ?? 0.5) * 560 + 20;
                  const cy = (e.coord_y ?? 0.5) * 380 + 20;
                  return (
                    <g
                      key={`adv-${e.id_jogador}`}
                      transform={`translate(${cx}, ${cy})`}
                      className="cursor-pointer"
                      onDoubleClick={() => handleDoubleClick(e)}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="16"
                        fill="#3b0a0a"
                        stroke="#ef4444"
                        strokeWidth="2"
                        className="opacity-70"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        className="font-sora font-bold text-[10px] fill-red-300 pointer-events-none"
                      >
                        {e.jogador?.numero_camisa_clube || e.id_jogador}
                      </text>
                      <rect
                        x="-28"
                        y="20"
                        width="56"
                        height="14"
                        rx="2"
                        fill="rgba(0,0,0,0.85)"
                        className="pointer-events-none"
                      />
                      <text
                        x="0"
                        y="30"
                        textAnchor="middle"
                        className="font-space font-bold text-[7px] fill-red-400/80 uppercase tracking-wider pointer-events-none"
                      >
                        {(e.jogador?.apelido || e.jogador?.nome_completo || "")
                          .split(" ")
                          .pop()
                          ?.substring(0, 8) || `#${e.id_jogador}`}
                      </text>
                    </g>
                  );
                })}

                {/* Jogadores próprios (metade de baixo) */}
                {titularesProprios.map((e) => {
                  const cx = (e.coord_x ?? 0.5) * 560 + 20;
                  const cy = (e.coord_y ?? 0.5) * 380 + 400;
                  return (
                    <g
                      key={`own-${e.id_jogador}`}
                      transform={`translate(${cx}, ${cy})`}
                      onPointerDown={(ev) => handlePointerDown(ev, e.id_jogador)}
                      onDoubleClick={() => handleDoubleClick(e)}
                      className={`${
                        isComissao
                          ? "cursor-grab active:cursor-grabbing"
                          : "cursor-pointer"
                      } group`}
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="18"
                        fill="#1a1f14"
                        stroke={
                          draggingId === e.id_jogador ? "#ffffff" : "#a2ff01"
                        }
                        strokeWidth="2"
                        className="transition-colors group-hover:stroke-white"
                      />
                      {draggingId === e.id_jogador && (
                        <circle
                          cx="0"
                          cy="0"
                          r="24"
                          fill="none"
                          stroke="#a2ff01"
                          strokeWidth="1"
                          className="opacity-40 animate-ping"
                        />
                      )}
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        className="font-sora font-bold text-[11px] fill-white pointer-events-none"
                      >
                        {e.jogador?.numero_camisa_clube || e.id_jogador}
                      </text>
                      <rect
                        x="-30"
                        y="22"
                        width="60"
                        height="16"
                        rx="2"
                        fill="rgba(0,0,0,0.85)"
                        className="pointer-events-none"
                      />
                      <text
                        x="0"
                        y="33"
                        textAnchor="middle"
                        className="font-space font-bold text-[8px] fill-pt-text-muted uppercase tracking-wider pointer-events-none"
                      >
                        {(e.jogador?.apelido || e.jogador?.nome_completo || "")
                          .split(" ")
                          .pop()
                          ?.substring(0, 8) || `#${e.id_jogador}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ── Reservas ── */}
          {reservasProprios.length > 0 && (
            <div className="bg-pt-surface-solid border border-pt-border p-4">
              <h3 className="font-space font-bold text-[10px] uppercase text-pt-primary tracking-[0.2em] mb-3 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                BANCO DE RESERVAS ({reservasProprios.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {reservasProprios.map((e) => (
                  <button
                    key={`res-${e.id_jogador}`}
                    onDoubleClick={() => handleDoubleClick(e)}
                    className="flex items-center gap-2 bg-pt-surface-bright border border-pt-border px-3 py-2 hover:border-pt-primary/50 transition-colors group"
                  >
                    <span className="w-7 h-7 flex items-center justify-center bg-pt-bg border border-pt-border text-pt-text font-sora font-bold text-xs group-hover:border-pt-primary/50 transition-colors">
                      {e.jogador?.numero_camisa_clube || e.id_jogador}
                    </span>
                    <div className="text-left">
                      <p className="font-sora font-bold text-[11px] text-pt-text truncate max-w-[100px]">
                        {e.jogador?.apelido || e.jogador?.nome_completo || `#${e.id_jogador}`}
                      </p>
                      <p className="font-space text-[8px] text-pt-text-muted uppercase tracking-widest">
                        {e.jogador?.posicao_principal || "—"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Painel Lateral ── */}
        <aside className="w-[360px] flex flex-col gap-4 shrink-0 overflow-y-auto">
          {/* ── Insight IA (Comissão Técnica) ── */}
          {isComissao && tatica?.insight && (
            <div className="bg-pt-surface-solid border border-pt-border overflow-hidden">
              <div className="px-5 py-3 bg-pt-bg border-b border-pt-border flex items-center gap-2">
                <Brain className="w-4 h-4 text-pt-primary" />
                <h3 className="font-space font-bold text-[10px] uppercase text-pt-primary tracking-[0.2em]">
                  Insights de IA
                </h3>
              </div>

              <div className="p-5 space-y-5">
                {/* Formações */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-pt-bg border border-pt-primary/30 p-3 text-center">
                    <span className="font-space text-[8px] text-pt-text-muted uppercase tracking-widest block mb-1">
                      Sua Formação
                    </span>
                    <span className="font-sora text-xl font-extrabold text-pt-primary">
                      {tatica.insight.formacao_detectada}
                    </span>
                  </div>
                  {tatica.insight.formacao_adversario && (
                    <div className="flex-1 bg-pt-bg border border-red-500/20 p-3 text-center">
                      <span className="font-space text-[8px] text-pt-text-muted uppercase tracking-widest block mb-1">
                        Adversário
                      </span>
                      <span className="font-sora text-xl font-extrabold text-red-400">
                        {tatica.insight.formacao_adversario}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pontos Fortes */}
                <div>
                  <h4 className="font-space text-[9px] font-bold uppercase text-green-400 tracking-[0.2em] mb-2 flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    Pontos Fortes
                  </h4>
                  <ul className="space-y-1.5">
                    {tatica.insight.pontos_fortes.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 font-geist text-xs text-pt-text leading-relaxed"
                      >
                        <ChevronRight className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pontos Fracos */}
                <div>
                  <h4 className="font-space text-[9px] font-bold uppercase text-amber-400 tracking-[0.2em] mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    Vulnerabilidades
                  </h4>
                  <ul className="space-y-1.5">
                    {tatica.insight.pontos_fracos.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 font-geist text-xs text-pt-text leading-relaxed"
                      >
                        <ChevronRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sugestões */}
                <div>
                  <h4 className="font-space text-[9px] font-bold uppercase text-pt-secondary tracking-[0.2em] mb-2 flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3" />
                    Sugestões Táticas
                  </h4>
                  <ul className="space-y-1.5">
                    {tatica.insight.sugestoes.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 font-geist text-xs text-pt-text leading-relaxed"
                      >
                        <ChevronRight className="w-3 h-3 text-pt-secondary mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Comparação */}
                {tatica.insight.comparacao_adversario && (
                  <div className="bg-pt-bg border border-pt-blue/30 p-3">
                    <h4 className="font-space text-[9px] font-bold uppercase text-pt-blue tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      <Swords className="w-3 h-3" />
                      Análise Comparativa
                    </h4>
                    <p className="font-geist text-xs text-pt-text leading-relaxed">
                      {tatica.insight.comparacao_adversario}
                    </p>
                  </div>
                )}

                {/* Titulares por linha */}
                {tatica.insight.titulares_por_linha && (
                  <div className="border-t border-pt-border pt-4">
                    <h4 className="font-space text-[9px] font-bold uppercase text-pt-text-muted tracking-[0.2em] mb-3">
                      Distribuição por Linha
                    </h4>
                    {Object.entries(tatica.insight.titulares_por_linha).map(
                      ([linha, jogadores]) =>
                        jogadores.length > 0 && (
                          <div key={linha} className="mb-2">
                            <span className="font-space text-[8px] font-bold uppercase text-pt-primary tracking-widest">
                              {linha}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {jogadores.map((nome, i) => (
                                <span
                                  key={i}
                                  className="bg-pt-surface-bright px-2 py-0.5 font-geist text-[10px] text-pt-text border border-pt-border"
                                >
                                  {nome}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Sem insight (mensagem para CT) ── */}
          {isComissao && !tatica?.insight && (
            <div className="bg-pt-surface-solid border border-pt-border p-6 flex flex-col items-center gap-3">
              <Brain className="w-8 h-8 text-pt-text-muted opacity-30" />
              <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] text-center">
                Os insights serão exibidos quando houver escalação registrada para esta partida.
              </p>
            </div>
          )}

          {/* ── Relatório Tático (Analista) ── */}
          {isAnalista && (
            <div className="bg-pt-surface-solid border border-pt-border overflow-hidden">
              <div className="px-5 py-3 bg-pt-bg border-b border-pt-border flex items-center gap-2">
                <FileText className="w-4 h-4 text-pt-primary" />
                <h3 className="font-space font-bold text-[10px] uppercase text-pt-primary tracking-[0.2em]">
                  Relatório Pré-Jogo
                </h3>
              </div>

              <div className="p-5 space-y-4">
                {/* Editor */}
                <div>
                  <label className="font-space text-[9px] font-bold uppercase text-pt-text-muted tracking-[0.2em] block mb-2">
                    {editandoRelatorio ? "Editando Relatório" : "Novo Relatório"}
                  </label>
                  <textarea
                    value={relatorioTexto}
                    onChange={(e) => setRelatorioTexto(e.target.value)}
                    rows={8}
                    className="w-full bg-pt-bg border border-pt-border p-3 text-pt-text font-geist text-sm resize-none focus:border-pt-primary/50 focus:outline-none transition-colors"
                    placeholder="Escreva a análise tática..."
                  />
                </div>

                <div>
                  <label className="font-space text-[9px] font-bold uppercase text-pt-text-muted tracking-[0.2em] flex items-center gap-1.5 mb-2">
                    <Image className="w-3 h-3" />
                    URLs de Imagens (uma por linha)
                  </label>
                  <textarea
                    value={relatorioImagens}
                    onChange={(e) => setRelatorioImagens(e.target.value)}
                    rows={3}
                    className="w-full bg-pt-bg border border-pt-border p-3 text-pt-text font-geist text-sm resize-none focus:border-pt-primary/50 focus:outline-none transition-colors"
                    placeholder="https://exemplo.com/imagem.png"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSalvarRelatorio}
                    disabled={!relatorioTexto.trim() || salvandoRelatorio}
                    className="flex-1 flex items-center justify-center gap-2 bg-pt-primary text-pt-bg font-space font-bold text-[10px] py-3 uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvandoRelatorio ? (
                      <div className="w-4 h-4 border-2 border-pt-bg/30 border-t-pt-bg rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {editandoRelatorio ? "ATUALIZAR" : "SALVAR"}
                  </button>
                  {editandoRelatorio && (
                    <button
                      onClick={() => {
                        setEditandoRelatorio(null);
                        setRelatorioTexto("");
                        setRelatorioImagens("");
                      }}
                      className="px-4 py-3 border border-pt-border text-pt-text-muted font-space font-bold text-[10px] uppercase tracking-widest hover:border-pt-primary/50 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {/* Sucesso */}
                {relatorioSucesso && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 p-3 animate-fade-in">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="font-space text-[10px] font-bold text-green-400 uppercase tracking-widest">
                      Relatório salvo com sucesso
                    </span>
                  </div>
                )}

                {/* Relatórios existentes */}
                {relatorios.length > 0 && (
                  <div className="border-t border-pt-border pt-4">
                    <h4 className="font-space text-[9px] font-bold uppercase text-pt-text-muted tracking-[0.2em] mb-3">
                      Relatórios Anteriores ({relatorios.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {relatorios.map((rel) => (
                        <div
                          key={rel.id}
                          className="bg-pt-bg border border-pt-border p-3 group hover:border-pt-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-space text-[8px] text-pt-text-muted uppercase tracking-widest">
                              {new Date(rel.criado_em).toLocaleString("pt-BR")}
                            </span>
                            <button
                              onClick={() => handleEditarRelatorio(rel)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-pt-text-muted hover:text-pt-primary transition-colors" />
                            </button>
                          </div>
                          <p className="font-geist text-xs text-pt-text leading-relaxed line-clamp-3">
                            {rel.conteudo_texto}
                          </p>
                          {rel.imagens_urls?.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Image className="w-3 h-3 text-pt-text-muted" />
                              <span className="font-space text-[8px] text-pt-text-muted uppercase">
                                {rel.imagens_urls.length} imagem(ns)
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Info da Escalação Adversária ── */}
          {escalacaoAdversario.length > 0 && (
            <div className="bg-pt-surface-solid border border-pt-border p-4">
              <h3 className="font-space font-bold text-[10px] uppercase text-red-400 tracking-[0.2em] mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                ESCALAÇÃO ADVERSÁRIA ({titularesAdversario.length} titulares)
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {titularesAdversario.map((e) => (
                  <button
                    key={`advlist-${e.id_jogador}`}
                    onDoubleClick={() => handleDoubleClick(e)}
                    className="flex items-center gap-2 bg-pt-bg border border-pt-border px-2 py-1.5 hover:border-red-500/30 transition-colors text-left"
                  >
                    <span className="font-sora font-bold text-[10px] text-red-400 w-5 text-center">
                      {e.jogador?.numero_camisa_clube || "?"}
                    </span>
                    <span className="font-geist text-[10px] text-pt-text truncate">
                      {e.jogador?.apelido || e.jogador?.nome_completo || `#${e.id_jogador}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Modal Jogador (duplo-clique) ── */}
      {jogadorModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setJogadorModal(null)}
        >
          <div
            className="bg-pt-surface-solid border border-pt-border w-full max-w-md relative animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setJogadorModal(null)}
              className="absolute top-4 right-4 text-pt-text-muted hover:text-pt-primary transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Foto + Nome */}
            <div className="p-6 border-b border-pt-border bg-pt-bg flex items-center gap-5">
              {jogadorModal.foto_url ? (
                <img
                  src={jogadorModal.foto_url}
                  alt={jogadorModal.apelido || jogadorModal.nome_completo}
                  className="w-20 h-20 object-cover border-2 border-pt-primary"
                />
              ) : (
                <div className="w-20 h-20 bg-pt-surface-bright border-2 border-pt-border flex items-center justify-center">
                  <User className="w-8 h-8 text-pt-text-muted" />
                </div>
              )}
              <div>
                <h2 className="font-sora text-xl font-extrabold uppercase tracking-tighter text-pt-text">
                  {jogadorModal.apelido || jogadorModal.nome_completo}
                </h2>
                {jogadorModal.apelido && jogadorModal.nome_completo && (
                  <p className="font-geist text-sm text-pt-text-muted">
                    {jogadorModal.nome_completo}
                  </p>
                )}
                {jogadorModal.posicao_principal && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-pt-primary/10 border border-pt-primary/30 font-space text-[9px] font-bold text-pt-primary uppercase tracking-widest">
                    {jogadorModal.posicao_principal}
                  </span>
                )}
              </div>
            </div>

            {/* Dados */}
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: "Camisa", value: jogadorModal.numero_camisa_clube ? `#${jogadorModal.numero_camisa_clube}` : "—" },
                { label: "Perna Boa", value: jogadorModal.perna_boa || "—" },
                { label: "Altura", value: jogadorModal.altura_cm ? `${jogadorModal.altura_cm} cm` : "—" },
                { label: "Peso", value: jogadorModal.peso_kg ? `${jogadorModal.peso_kg} kg` : "—" },
              ].map((item) => (
                <div key={item.label} className="bg-pt-bg border border-pt-border p-3">
                  <span className="font-space text-[8px] font-bold uppercase text-pt-text-muted tracking-widest block mb-1">
                    {item.label}
                  </span>
                  <span className="font-sora text-lg font-bold text-pt-text">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
