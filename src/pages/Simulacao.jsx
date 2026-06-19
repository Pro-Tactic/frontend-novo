import React, { useState, useEffect, useRef } from "react";
import { simularPartida } from "../services/simulacao";
import { api } from "../services/api";

const TODAS_FORMACOES = [
  "4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "5-3-2", "4-1-4-1", "4-5-1", 
  "3-4-3", "5-4-1", "4-3-1-2", "4-2-2-2", "3-6-1", "4-6-0", "3-4-1-2", 
  "5-2-3", "3-5-1-1", "4-1-2-1-2", "4-4-1-1", "3-4-2-1", "5-2-1-2", 
  "4-2-1-3", "4-3-2-1", "5-3-1-1", "3-3-3-1", "4-1-3-2", "3-2-4-1", 
  "5-2-2-1", "4-2-4", "3-1-4-2"
];

const calculateFormationString = (positions) => {
  const outfield = positions.filter(p => !p.isGk);
  if (outfield.length === 0) return "0";
  
  // Sort by Y descending (bottom to top = defense to attack)
  const sorted = [...outfield].sort((a,b) => b.cy - a.cy);
  
  const lines = [];
  let currentLine = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    // If the vertical distance is small (< 50), group them in the same line
    if (Math.abs(sorted[i].cy - currentLine[0].cy) < 50) {
      currentLine.push(sorted[i]);
    } else {
      lines.push(currentLine.length);
      currentLine = [sorted[i]];
    }
  }
  lines.push(currentLine.length);
  
  return lines.join("-");
};

const getInitialPositions = (formacaoStr, jogadores) => {
  const gk = jogadores.find(j => j.posicao_principal === 'GOL' || j.posicao_principal === 'GK');
  const outfield = jogadores.filter(j => j !== gk);
  
  const parts = formacaoStr.split('-').map(Number).filter(n => !isNaN(n));
  let positions = [];
  
  if (gk) {
    positions.push({ ...gk, cx: 300, cy: 720, isGk: true });
  }

  if (parts.length === 0 || outfield.length === 0) return positions;

  let availableYStart = 600; 
  let availableYEnd = 150;   
  let stepY = parts.length > 1 ? (availableYStart - availableYEnd) / (parts.length - 1) : 0;

  let playerIndex = 0;

  parts.forEach((count, lineIndex) => {
    let cy = parts.length === 1 ? 400 : availableYStart - (stepY * lineIndex);
    let stepX = 500 / (count + 1);
    
    for (let i = 0; i < count; i++) {
      if (playerIndex < outfield.length) {
        let cx = 50 + stepX * (i + 1);
        positions.push({ ...outfield[playerIndex], cx, cy, isGk: false });
        playerIndex++;
      }
    }
  });

  while (playerIndex < outfield.length) {
    positions.push({ ...outfield[playerIndex], cx: 300, cy: 400, isGk: false });
    playerIndex++;
  }

  return positions;
};

export default function Simulacao() {
  const [times, setTimes] = useState([]);
  const [ligas, setLigas] = useState([]);
  const [ligaId, setLigaId] = useState("");
  const [timesInLiga, setTimesInLiga] = useState([]);
  const [adversarioId, setAdversarioId] = useState("");
  const [estilo, setEstilo] = useState("normal");
  const [formacaoDropdown, setFormacaoDropdown] = useState("4-3-3");
  const [formacaoAtual, setFormacaoAtual] = useState("4-3-3");
  
  const [linhaDefensiva, setLinhaDefensiva] = useState(50);
  const [pressao, setPressao] = useState(50);
  const [largura, setLargura] = useState(50);
  const [result, setResult] = useState(null);
  const [timeId, setTimeId] = useState(null);

  const [positions, setPositions] = useState([]);
  const svgRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const meRes = await api.get('/api/v1/usuarios/me');
        setTimeId(meRes.data.id_clube);
      } catch (err) {
        console.error("Erro ao buscar usuario", err);
      }

      try {
        const [ligasRes, timesRes] = await Promise.all([
          api.get("/api/v1/ligas/"),
          api.get("/api/v1/times/")
        ]);
        setLigas(ligasRes.data);
        setTimes(timesRes.data);
        setTimesInLiga(timesRes.data);
        if (timesRes.data.length > 0) {
          setAdversarioId(timesRes.data[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar dados base", err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function filterTimesByLiga() {
      if (!ligaId) {
        setTimesInLiga(times);
        if (times.length > 0) setAdversarioId(times[0].id);
        return;
      }
      try {
        const res = await api.get(`/api/v1/ligas/${ligaId}/times`);
        const validTimeIds = new Set(res.data.map(lt => lt.id_time));
        const filtered = times.filter(t => validTimeIds.has(t.id));
        setTimesInLiga(filtered);
        if (filtered.length > 0) setAdversarioId(filtered[0].id);
        else setAdversarioId("");
      } catch (err) {
        console.error("Erro ao buscar times da liga", err);
      }
    }
    if (times.length > 0) {
      filterTimesByLiga();
    }
  }, [ligaId, times]);

  const handleExecute = async () => {
    if (!timeId) return;
    try {
      const data = await simularPartida({
        time_id: parseInt(timeId),
        adversario_id: parseInt(adversarioId) || 1,
        estilo,
        formacao: formacaoAtual,
        linha_defensiva: parseInt(linhaDefensiva),
        pressao: parseInt(pressao),
        largura: parseInt(largura)
      });
      setResult(data);
      
      const newPos = getInitialPositions(formacaoAtual, data.escalacao_titular);
      setPositions(newPos);
      setFormacaoDropdown(formacaoAtual);
      
    } catch (err) {
      console.error(err);
      alert("Erro na simulação");
    }
  };

  const handleDropdownChange = (f) => {
    setFormacaoDropdown(f);
    setFormacaoAtual(f);
    if (result) {
      setPositions(getInitialPositions(f, result.escalacao_titular));
    }
  };

  const handlePointerDown = (e, id, isGk) => {
    if (isGk) return;
    e.target.setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e) => {
    if (!draggingId) return;
    const svg = svgRef.current;
    if (!svg) return;
    
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    
    // Bounds check
    let cx = cursorPt.x;
    let cy = cursorPt.y;
    if (cx < 20) cx = 20;
    if (cx > 580) cx = 580;
    if (cy < 20) cy = 20;
    if (cy > 780) cy = 780;

    setPositions(prev => {
      const next = prev.map(p => p.id === draggingId ? { ...p, cx, cy } : p);
      const novaFormacao = calculateFormationString(next);
      setFormacaoAtual(novaFormacao);
      return next;
    });
  };

  const handlePointerUp = (e) => {
    setDraggingId(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden p-6 gap-6 bg-pt-bg">
      <aside className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto custom-scrollbar">
        <div className="bg-pt-surface-solid border border-pt-border p-6 relative overflow-hidden shrink-0">
          <div className="flex flex-col gap-4 mb-6">
            <div className="w-full">
              <h2 className="font-space font-bold text-[10px] uppercase text-pt-text-muted mb-1">COMPETIÇÃO</h2>
              <select 
                className="bg-pt-surface-bright text-pt-white border border-pt-border p-2 w-full font-sora font-bold outline-none"
                value={ligaId}
                onChange={e => setLigaId(e.target.value)}
              >
                <option value="">Todas as Competições</option>
                {ligas.map(l => (
                  <option key={l.id} value={l.id}>{l.nome_liga}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <h2 className="font-space font-bold text-[10px] uppercase text-pt-text-muted mb-1">PRÓXIMA PARTIDA</h2>
              <select 
                className="bg-pt-surface-bright text-pt-white border border-pt-border p-2 w-full font-sora font-bold outline-none"
                value={adversarioId}
                onChange={e => setAdversarioId(e.target.value)}
              >
                {timesInLiga.map(t => (
                  <option key={t.id} value={t.id}>{t.nome_clube}</option>
                ))}
              </select>
            </div>
          </div>
          {result && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-space font-bold text-[10px] uppercase text-pt-text-muted">POSSE ESTIMADA</span>
                  <span className="font-space font-bold text-[10px] uppercase text-pt-primary">
                    {result.estatisticas.posse_bola_time.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-pt-surface-bright h-1">
                  <div className="bg-pt-primary h-1" style={{ width: `${result.estatisticas.posse_bola_time}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between font-space font-bold text-[10px] uppercase">
                <span className="text-pt-text-muted">xG NOSSO: {result.estatisticas.expected_goals_time.toFixed(2)}</span>
                <span className="text-red-500">xG DELES: {result.estatisticas.expected_goals_adversario.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-pt-surface-solid border border-pt-border p-6 flex-1 shrink-0">
          <h3 className="font-space font-bold text-[10px] uppercase text-pt-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">tune</span>
            PARÂMETROS DE SISTEMA
          </h3>
          
          <div className="space-y-6">
            <div>
              <span className="font-space font-bold text-[10px] uppercase text-pt-text-muted block mb-3">ESTILO GERAL</span>
              <div className="grid grid-cols-3 gap-2">
                {["ofensivo", "normal", "defensivo"].map(est => (
                  <button 
                    key={est}
                    onClick={() => setEstilo(est)}
                    className={`font-space font-bold text-[10px] py-2 border transition-colors uppercase ${estilo === est ? 'bg-pt-primary text-pt-bg border-pt-primary' : 'bg-pt-surface-bright text-pt-text-muted border-pt-border'}`}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-4">
                <span className="font-space font-bold text-[10px] uppercase text-pt-text-muted">LINHA DEFENSIVA</span>
                <span className="font-space font-bold text-[10px] uppercase text-pt-primary">{linhaDefensiva}</span>
              </div>
              <input className="w-full accent-pt-primary" type="range" min="1" max="100" value={linhaDefensiva} onChange={e => setLinhaDefensiva(e.target.value)} />
            </div>

            <div>
              <div className="flex justify-between mb-4">
                <span className="font-space font-bold text-[10px] uppercase text-pt-text-muted">INTENSIDADE PRESSÃO</span>
                <span className="font-space font-bold text-[10px] uppercase text-pt-primary">{pressao}</span>
              </div>
              <input className="w-full accent-pt-primary" type="range" min="1" max="100" value={pressao} onChange={e => setPressao(e.target.value)} />
            </div>
            
            <div className="pt-4 border-t border-pt-border">
              <span className="font-space font-bold text-[10px] uppercase text-pt-text-muted block mb-3">FORMAÇÃO BASE (GRID)</span>
              <select 
                className="bg-pt-surface-bright text-pt-white border border-pt-border p-2 w-full font-space text-[12px] font-bold outline-none"
                value={formacaoDropdown}
                onChange={e => handleDropdownChange(e.target.value)}
              >
                {TODAS_FORMACOES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleExecute} className="w-full bg-pt-primary text-pt-bg font-space font-bold text-[10px] py-4 uppercase tracking-widest hover:brightness-110 transition-all duration-300 shrink-0 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">psychology</span>
          SIMULAR ANÁLISE
        </button>
      </aside>

      <div className="flex-1 bg-pt-surface-bright/20 border border-pt-border relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Dynamic Display of the Current Computed Formation */}
        <div className="absolute top-4 z-10 bg-pt-surface-solid border border-pt-border px-6 py-3 rounded shadow-lg flex flex-col items-center">
          <span className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mb-1">
            Formação do Time
          </span>
          <span className="font-sora text-3xl font-extrabold text-pt-primary">
            {formacaoAtual}
          </span>
        </div>

        <svg 
          ref={svgRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full p-8 max-h-[850px]" 
          viewBox="0 0 600 800" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Pitch Lines (Static) */}
          <g className="opacity-20 stroke-white stroke-2 fill-none pointer-events-none">
            <rect x="20" y="20" width="560" height="760"></rect>
            <line x1="20" y1="400" x2="580" y2="400"></line>
            <circle cx="300" cy="400" r="60"></circle>
            <circle cx="300" cy="400" r="3" fill="white"></circle>
            <rect x="150" y="20" width="300" height="120"></rect>
            <rect x="220" y="20" width="160" height="40"></rect>
            <rect x="150" y="660" width="300" height="120"></rect>
            <rect x="220" y="740" width="160" height="40"></rect>
          </g>

          {/* Draggable Players */}
          {positions.map(p => (
            <g 
              key={p.id}
              transform={`translate(${p.cx}, ${p.cy})`}
              onPointerDown={(e) => handlePointerDown(e, p.id, p.isGk)}
              className={`${p.isGk ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} group transition-transform duration-75`}
            >
              <circle 
                cx="0" 
                cy="0" 
                r="18" 
                fill={p.isGk ? "#f59e0b" : "#1a1f14"} 
                stroke={p.isGk ? "#f59e0b" : "#a2ff01"} 
                strokeWidth="2" 
                className="hover:stroke-white transition-colors"
              />
              <text 
                x="0" 
                y="5" 
                textAnchor="middle" 
                className="font-sora font-bold text-[12px] fill-white pointer-events-none"
              >
                {p.numero_camisa_clube || Math.round(p.nota)}
              </text>
              <rect 
                x="-30" 
                y="22" 
                width="60" 
                height="16" 
                rx="2" 
                fill="rgba(0,0,0,0.8)" 
                className="pointer-events-none"
              />
              <text 
                x="0" 
                y="33" 
                textAnchor="middle" 
                className="font-space font-bold text-[8px] fill-pt-text-muted uppercase tracking-wider pointer-events-none"
              >
                {p.nome_completo.split(' ').pop().substring(0, 8)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <aside className="w-72 bg-pt-surface-solid border border-pt-border p-6 flex flex-col shrink-0">
        <h3 className="font-space font-bold text-[10px] uppercase text-pt-primary mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">groups</span>
          BANCO DE RESERVAS
        </h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {result && result.escalacao_reserva.map(j => (
            <div key={j.id} className="flex items-center gap-3 p-3 bg-pt-surface-bright border border-pt-border">
              <span className="font-space font-bold text-pt-text-muted w-6 text-center">{j.numero_camisa_clube || Math.round(j.nota)}</span>
              <div className="flex-1">
                <p className="font-sora font-bold text-xs text-pt-white truncate max-w-[150px]">{j.nome_completo}</p>
                <p className="font-space text-[9px] text-pt-text-muted uppercase tracking-widest">{j.posicao_principal}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
