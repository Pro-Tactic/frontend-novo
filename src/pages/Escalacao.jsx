import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractList } from "../services/api";
import Swal from 'sweetalert2';
import { ArrowLeft, Users, Shield, Target, Zap } from "lucide-react";

const TIPOS_ESCALACAO = [
    { key: 'PADRAO', label: 'TÁTICA PADRÃO' },
    { key: 'DEFENSIVA', label: 'VARIAÇÃO DEFENSIVA' },
    { key: 'OFENSIVA', label: 'VARIAÇÃO OFENSIVA' },
];

const TIPO_LABEL = {
    PADRAO: 'PADRÃO',
    DEFENSIVA: 'DEFENSIVA',
    OFENSIVA: 'OFENSIVA',
};

export default function Escalacao() {
    const { partidaId } = useParams();
    const navigate = useNavigate();
    const fieldRef = useRef(null);

    const [activeTipo, setActiveTipo] = useState('PADRAO');
    const [match, setMatch] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);
    const [baseLineup, setBaseLineup] = useState([]);
    const [lineup, setLineup] = useState([]);
    const [hydratedLineup, setHydratedLineup] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formationName, setFormationName] = useState("?-?-?");

    useEffect(() => {
        fetchData();
    }, [partidaId, activeTipo]);

    useEffect(() => {
        if (allPlayers.length > 0 && lineup) {
            const hydrated = lineup.map(l => {
                const playerId = typeof l.jogador === 'object' ? l.jogador.id : l.jogador;
                const playerObj = allPlayers.find(p => p.id === playerId);
                return {
                    ...l,
                    jogador: playerObj || { id: playerId, nome: 'Desconhecido', posicao: '?' }
                };
            });
            setHydratedLineup(hydrated);
            calculateFormation(hydrated);
        } else {
            setHydratedLineup([]);
            setFormationName("?-?-?");
        }
    }, [lineup, allPlayers]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [matchRes, playersRes, baseLineupRes] = await Promise.all([
                api.get(`/partidas/${partidaId}/`),
                api.get('/jogadores/'),
                api.get(`/escalacoes/?partida=${partidaId}&tipo=PADRAO`),
            ]);

            let lineupRes = baseLineupRes;
            if (activeTipo !== 'PADRAO') {
                lineupRes = await api.get(`/escalacoes/?partida=${partidaId}&tipo=${activeTipo}`);
            }

            setMatch(matchRes.data);
            setAllPlayers(extractList(playersRes.data));
            setBaseLineup(extractList(baseLineupRes.data));
            setLineup(extractList(lineupRes.data));

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFormation = (currentLineup) => {
        const titulares = currentLineup.filter(l => l.status === 'TITULAR');
        let def = 0, mid = 0, att = 0;

        titulares.forEach(l => {
            if (l.y === null || l.y === undefined) return;
            if (l.jogador.posicao === 'Goleiro') return;

            if (l.y < 30) {
                att++;
            } else if (l.y < 60) {
                mid++;
            } else if (l.y < 85) {
                def++;
            }
        });

        setFormationName(`${def}-${mid}-${att}`);
    };

    const handleDragStart = (e, player, origin, escalacaoId = null) => {
        setDraggedItem({ player, origin, escalacaoId });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e, targetZone) => {
        e.preventDefault();
        if (!draggedItem) return;

        const basePlayerIds = new Set(baseLineup.map(item => (typeof item.jogador === 'object' ? item.jogador.id : item.jogador)));
        const swalConfig = { background: '#0B0B0B', color: '#FEFEFE', confirmButtonColor: '#A2FF01' };

        if (activeTipo !== 'PADRAO' && basePlayerIds.size === 0) {
            Swal.fire({ icon: 'warning', title: 'CONFIGURAÇÃO BLOQUEADA', text: 'A tática padrão deve ser definida antes de qualquer variação estratégica.', ...swalConfig });
            setDraggedItem(null);
            return;
        }

        const { player, origin, escalacaoId } = draggedItem;

        if (origin === 'nao-relacionados' && activeTipo !== 'PADRAO' && !basePlayerIds.has(player.id)) {
            Swal.fire({ icon: 'warning', title: 'ATLETA INDISPONÍVEL', text: 'Apenas jogadores da tática padrão podem ser utilizados em variações.', ...swalConfig });
            setDraggedItem(null);
            return;
        }

        let newX = null, newY = null;

        if (targetZone === 'titulares' && fieldRef.current) {
            const rect = fieldRef.current.getBoundingClientRect();
            newX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            newY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

            const isGoleiro = (player?.posicao || '').trim() === 'Goleiro';
            const naLinhaDoGoleiro = newY >= 85;

            if (!isGoleiro && naLinhaDoGoleiro) {
                Swal.fire({ icon: 'warning', title: 'POSICIONAMENTO ILÍCITO', text: 'Esta zona é exclusiva para a heráldica de Goleiro.', ...swalConfig });
                setDraggedItem(null); return;
            }
            if (isGoleiro && !naLinhaDoGoleiro) {
                Swal.fire({ icon: 'warning', title: 'CENTRO DE DEFESA', text: 'O Goleiro deve ser alocado em sua área de atuação primária.', ...swalConfig });
                setDraggedItem(null); return;
            }
        }

        const currentTitulares = hydratedLineup.filter(l => l.status === 'TITULAR').length;
        const currentReservas = hydratedLineup.filter(l => l.status === 'RESERVA').length;

        if (targetZone === 'titulares' && origin !== 'titulares' && currentTitulares >= 11) {
            Swal.fire({ icon: 'warning', title: 'LIMITE ATINGIDO', text: 'O sistema não admite exceder 11 combatentes em campo.', ...swalConfig });
            return;
        }
        if (targetZone === 'reservas' && origin !== 'reservas' && currentReservas >= 6) {
            Swal.fire({ icon: 'warning', title: 'BANCO OVERLOAD', text: 'Limite de suporte estratégico atingido (6 atletas).', ...swalConfig });
            return;
        }

        try {
            if (targetZone === 'nao-relacionados') {
                setLineup(prev => prev.filter(item => item.id !== escalacaoId));
                await api.delete(`/escalacoes/${escalacaoId}/`);
            } else {
                const status = targetZone === 'titulares' ? 'TITULAR' : 'RESERVA';
                const payload = { status, tipo: activeTipo };
                if (targetZone === 'titulares' && newX !== null) {
                    payload.x = newX; payload.y = newY;
                }

                if (origin === 'nao-relacionados') {
                    const tempId = `tmp:${player.id}`;
                    setLineup(prev => ([...prev, { id: tempId, partida: partidaId, jogador: player.id, tipo: activeTipo, status, x: payload.x ?? null, y: payload.y ?? null }]));
                    const res = await api.post('/escalacoes/', { partida: partidaId, jogador: player.id, ...payload });
                    setLineup(prev => prev.map(item => (item.id === tempId ? res.data : item)));
                } else {
                    setLineup(prev => prev.map(item => {
                        if (item.id !== escalacaoId) return item;
                        return { ...item, status, x: targetZone === 'titulares' ? (payload.x ?? item.x) : null, y: targetZone === 'titulares' ? (payload.y ?? item.y) : null };
                    }));
                    const res = await api.patch(`/escalacoes/${escalacaoId}/`, payload);
                    setLineup(prev => prev.map(item => (item.id === escalacaoId ? res.data : item)));
                }
            }
        } catch (error) {
            console.error("Erro ao mover:", error);
            Swal.fire({ icon: 'error', title: 'ERRO TÁTICO', text: 'Sincronização falhou.', background: '#0B0B0B', color: '#FEFEFE', confirmButtonColor: '#FF4B4B' });
            fetchData();
        } finally {
            setDraggedItem(null);
        }
    };

    if (loading && allPlayers.length === 0) return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pt-bg text-pt-primary gap-4">
        <div className="w-12 h-12 border-4 border-pt-primary/30 border-t-pt-primary rounded-full animate-spin" />
        <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">Carregando...</span>
      </div>
    );

    if (!match) return <div className="min-h-screen bg-pt-bg flex items-center justify-center font-black text-white italic">DADOS INCONSISTENTES.</div>;

    const basePlayerIds = new Set(baseLineup.map(item => (typeof item.jogador === 'object' ? item.jogador.id : item.jogador)));
    const isVariacao = activeTipo !== 'PADRAO';
    const escalaPadraoExiste = basePlayerIds.size > 0;
    const podeEditarEscalacao = !isVariacao || escalaPadraoExiste;

    const titulares = hydratedLineup.filter(l => l.status === 'TITULAR');
    const reservas = hydratedLineup.filter(l => l.status === 'RESERVA');
    const relatedIds = new Set(hydratedLineup.map(l => l.jogador.id));
    const jogadoresPermitidos = isVariacao ? allPlayers.filter(p => basePlayerIds.has(p.id)) : allPlayers;
    const naoRelacionados = jogadoresPermitidos.filter(p => !relatedIds.has(p.id));

    return (
        <div className="min-h-screen bg-pt-bg p-8 space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-[18px] bg-pt-surface border border-pt-white/10 text-pt-text-muted hover:text-pt-primary hover:border-pt-primary/30 flex items-center justify-center transition-all shadow-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Quadro Tático</h1>
                        <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                            {(match.nome_mandante || 'MANDANTE').toUpperCase()} <span className="text-pt-primary">VS</span> {(match.nome_visitante || 'VISITANTE').toUpperCase()}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 p-1 bg-pt-surface border border-pt-white/10 rounded-[20px] shadow-2xl">
                    {TIPOS_ESCALACAO.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTipo(tab.key)}
                            className={`px-6 py-2.5 rounded-[16px] text-[10px] font-black tracking-widest transition-all ${activeTipo === tab.key ? 'bg-pt-primary text-pt-bg shadow-xl' : 'text-pt-text-muted hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {!podeEditarEscalacao && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-4">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <p className="font-black text-[10px] uppercase tracking-widest text-yellow-500/80">Bloqueio Operacional: Defina a tática padrão antes de acessar variações.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 h-[720px]">
                <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-6 flex flex-col shadow-2xl overflow-hidden relative" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'nao-relacionados')}>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Disponíveis</h2>
                            <p className="text-[9px] font-bold text-pt-text-muted uppercase tracking-widest">Base de Dados</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-pt-bg border border-pt-white/5 flex items-center justify-center text-pt-primary font-black text-xs">{naoRelacionados.length}</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {naoRelacionados.map(player => (
                            <div
                                key={player.id} draggable={podeEditarEscalacao}
                                onDragStart={(e) => podeEditarEscalacao && handleDragStart(e, player, 'nao-relacionados')}
                                className={`group p-4 rounded-2xl bg-pt-bg/50 border border-pt-white/5 transition-all ${podeEditarEscalacao ? 'cursor-grab hover:border-pt-primary/40 hover:bg-pt-primary/5 active:cursor-grabbing' : 'grayscale opacity-30 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-xs text-white uppercase tracking-wider">{player.nome}</span>
                                    <span className="text-[9px] text-pt-primary px-2 py-1 bg-pt-primary/10 rounded-lg font-black">{player.posicao.toUpperCase()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6 relative">
                    <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-4 flex-1 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="flex items-center justify-center gap-10 mb-6 animate-in slide-in-from-top-4 duration-1000">
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black italic text-pt-primary leading-none tabular-nums">{titulares.length}</span>
                                <span className="text-[8px] font-black text-pt-text-muted tracking-[0.3em] uppercase mt-1">Jogadores no time</span>
                            </div>
                            
                            <div className="h-10 w-px bg-pt-white/5" />

                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-black italic text-pt-primary tracking-tighter tabular-nums leading-none">{formationName}</span>
                                <span className="text-[8px] font-black text-pt-text-muted tracking-[0.2em] uppercase mt-1">Set-up Tático</span>
                            </div>
                        </div>

                        <div
                            ref={fieldRef}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'titulares')}
                            className="relative flex-1 bg-[#1a3a14] rounded-[32px] overflow-hidden border-4 border-pt-white/10 m-2 shadow-inner group select-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"
                        >
                            {/* Grama Realista com Padrão de Faixas e Zonas */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {/* Padrão de Faixas (Mowed Grass) */}
                                <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(0deg,#244919,#244919_40px,#2d5a1f_40px,#2d5a1f_80px)]" />
                                
                                {/* Overlay das Zonas (Goleiro, Defesa, Meio, Ataque) */}
                                {/* Zona Goleiro (Bottom 15%) */}
                                <div className="absolute bottom-0 left-0 w-full h-[15%] bg-pt-primary/5 border-t border-pt-primary/10 shadow-[inset_0_20px_40px_rgba(0,0,0,0.3)]" />
                                {/* Zona Defesa (15% to 40%) */}
                                <div className="absolute bottom-[15%] left-0 w-full h-[25%] bg-sky-500/[0.03] border-t border-white/5" />
                                {/* Zona Meio (40% to 70%) */}
                                <div className="absolute bottom-[40%] left-0 w-full h-[30%] bg-pt-primary/5 border-t border-white/5" />
                                {/* Zona Ataque (70% to 100%) */}
                                <div className="absolute bottom-[70%] left-0 w-full h-[30%] bg-red-500/[0.03] border-t border-white/5" />
                            </div>

                            {/* Marcações do Campo (SVG) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Linha Lateral e de Fundo */}
                                <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.5" />
                                
                                {/* Linha de Meio Campo */}
                                <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.5" />
                                <circle cx="50" cy="50" r="10" fill="none" stroke="white" strokeWidth="0.5" />
                                <circle cx="50" cy="50" r="0.5" fill="white" />

                                {/* Área de Ataque (Topo) */}
                                <rect x="25" y="5" width="50" height="15" fill="none" stroke="white" strokeWidth="0.5" /> {/* Grande Área */}
                                <rect x="37" y="5" width="26" height="5" fill="none" stroke="white" strokeWidth="0.5" />  {/* Pequena Área */}
                                <path d="M 40 20 Q 50 25 60 20" fill="none" stroke="white" strokeWidth="0.5" /> {/* Meia Lua */}
                                
                                {/* Área de Defesa (Fundo) */}
                                <rect x="25" y="80" width="50" height="15" fill="none" stroke="white" strokeWidth="0.5" /> {/* Grande Área */}
                                <rect x="37" y="90" width="26" height="5" fill="none" stroke="white" strokeWidth="0.5" />  {/* Pequena Área */}
                                <path d="M 40 80 Q 50 75 60 80" fill="none" stroke="white" strokeWidth="0.5" /> {/* Meia Lua */}

                                {/* Pontos de Pênalti */}
                                <circle cx="50" cy="15" r="0.3" fill="white" />
                                <circle cx="50" cy="85" r="0.3" fill="white" />

                                {/* Escanteios */}
                                <path d="M 5 6 A 1 1 0 0 0 6 5" fill="none" stroke="white" strokeWidth="0.5" />
                                <path d="M 94 5 A 1 1 0 0 0 95 6" fill="none" stroke="white" strokeWidth="0.5" />
                                <path d="M 95 94 A 1 1 0 0 0 94 95" fill="none" stroke="white" strokeWidth="0.5" />
                                <path d="M 6 95 A 1 1 0 0 0 5 94" fill="none" stroke="white" strokeWidth="0.5" />
                            </svg>

                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />

                            {titulares.map((escalacao) => (
                                <div
                                    key={escalacao.id}
                                    style={{ top: `${escalacao.y}%`, left: `${escalacao.x}%` }}
                                    draggable={podeEditarEscalacao}
                                    onDragStart={(e) => podeEditarEscalacao && handleDragStart(e, escalacao.jogador, 'titulares', escalacao.id)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/player z-10 p-2 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform duration-300"
                                >
                                    <div className={`relative w-14 h-14 rounded-full border-4 transition-all shadow-2xl flex items-center justify-center overflow-hidden group-hover/player:shadow-pt-primary/40 ${escalacao.jogador.posicao === 'Goleiro' ? 'bg-yellow-500 border-yellow-300' : 'bg-pt-bg border-pt-primary/60 group-hover/player:border-pt-primary'}`}>
                                        {escalacao.jogador.foto ? (
                                            <img 
                                                src={escalacao.jogador.foto} 
                                                alt={escalacao.jogador.nome} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center ${escalacao.jogador.foto ? 'hidden' : 'flex'}`}>
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-white/20 pointer-events-none" />
                                            <span className={`font-black text-xs ${escalacao.jogador.posicao === 'Goleiro' ? 'text-pt-bg' : 'text-pt-primary'}`}>
                                                {escalacao.jogador.posicao === 'Goleiro' ? 'GK' : (escalacao.jogador.numero || '??')}
                                            </span>
                                        </div>
                                        {/* Glow effect overlay */}
                                        <div className="absolute -inset-1 rounded-full bg-pt-primary/10 blur-md opacity-0 group-hover/player:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="mt-3 px-3 py-1 bg-pt-bg/95 backdrop-blur-md border border-pt-white/20 rounded-lg text-center shadow-2xl relative min-w-[90px]">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap drop-shadow-md">{escalacao.jogador.nome.split(' ')[0]}</p>
                                        <div className="flex items-center justify-center gap-1 mt-0.5 opacity-80">
                                            <div className={`w-1.5 h-1.5 rounded-full ${escalacao.jogador.posicao === 'Goleiro' ? 'bg-yellow-400' : 'bg-pt-primary'}`} />
                                            <span className="text-[7px] font-black text-pt-text-muted uppercase tracking-[0.1em]">{escalacao.jogador.posicao}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-6 flex flex-col shadow-2xl overflow-hidden relative" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'reservas')}>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Reservas</h2>
                            <p className="text-[9px] font-bold text-pt-text-muted uppercase tracking-widest">Suporte Tático</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-pt-bg border border-pt-white/5 flex items-center justify-center text-pt-primary font-black text-xs">{reservas.length}/6</div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {reservas.map(escalacao => (
                            <div
                                key={escalacao.id} draggable={podeEditarEscalacao}
                                onDragStart={(e) => podeEditarEscalacao && handleDragStart(e, escalacao.jogador, 'reservas', escalacao.id)}
                                className={`group p-4 rounded-2xl bg-pt-bg border border-pt-primary/10 transition-all ${podeEditarEscalacao ? 'cursor-grab hover:border-pt-primary hover:bg-pt-primary/5' : 'opacity-30'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-pt-primary flex items-center justify-center text-pt-bg font-black text-[10px]">R</div>
                                    <div className="space-y-0.5">
                                        <p className="font-black text-xs text-white uppercase tracking-wide">{escalacao.jogador.nome}</p>
                                        <p className="text-[8px] font-black text-pt-primary uppercase tracking-[0.2em]">{escalacao.jogador.posicao}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {reservas.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 opacity-20 text-center gap-4">
                                <Users className="w-10 h-10" />
                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Célula Vazia</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-pt-white/5 flex items-center justify-between opacity-30">
                        <span className="text-[8px] font-black uppercase tracking-widest leading-none">PT-TACTIC ENGINE v4.0</span>
                        <Target className="w-3 h-3 text-pt-primary" />
                    </div>
                </div>
            </div>
        </div>
    );
}
