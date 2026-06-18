import { useState, useEffect } from "react";
import { api } from "../services/api";
import { getUserId } from "../services/auth";
import { Calendar, Activity, ShieldCheck, TrendingUp, Trophy } from "lucide-react";

export default function Inicio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [meRes, calendarioRes, classificacaoRes, jogadoresRes] = await Promise.all([
          api.get('/api/v1/usuarios/me'),
          api.get('/api/v1/partidas/calendario?data_inicio=2023-01-01&data_fim=2030-12-31'),
          api.get('/api/v1/partidas/classificacao'),
          api.get('/api/v1/jogadores/')
        ]);

        const me = meRes.data;
        const time_id = me.id_clube;
        const calendario = Array.isArray(calendarioRes.data) ? calendarioRes.data : [];
        const classif = Array.isArray(classificacaoRes.data) ? classificacaoRes.data.find(c => c.time_id === time_id) || {} : {};
        const jogadores = Array.isArray(jogadoresRes.data) ? jogadoresRes.data.slice(0, 11) : [];

        // Find next game
        const proximos = calendario.filter(p => !p.is_passada).sort((a,b) => new Date(a.data_hora_partida) - new Date(b.data_hora_partida));
        const proximo_jogo = proximos.length > 0 ? proximos[0] : null;

        const adv = proximo_jogo ? (proximo_jogo.time_mandante?.id === time_id ? proximo_jogo.time_visitante?.nome_clube : proximo_jogo.time_mandante?.nome_clube) : "TBD";

        setData({
          clube: { nome: classif.time_nome || me.clube_nome || "Meu Clube", pais: "BRA" },
          estatisticas: { 
            total_jogos: classif.jogos || 0, 
            vitorias: classif.vitorias || 0, 
            aproveitamento: classif.jogos ? Math.round((classif.pontos / (classif.jogos * 3)) * 100) : 0 
          },
          proximo_jogo: proximo_jogo ? {
            competicao: proximo_jogo.competicao?.nome_liga || "Amistoso",
            adversario: adv || "Indefinido",
            local: proximo_jogo.time_mandante?.id === time_id ? "CASA" : "FORA",
            data_hora: proximo_jogo.data_hora_partida,
            estadio: proximo_jogo.local_partida || "Estádio Principal"
          } : { competicao: "--", adversario: "Sem Partidas Agendadas", local: "--", data_hora: new Date(), estadio: "--" },
          origem_escalacao: "Plantel Principal",
          provavel_escalacao: jogadores.map(j => ({
            jogador_id: j.id,
            nome: j.apelido || j.nome_completo,
            posicao: j.posicao_principal || "--"
          }))
        });
      } catch (err) {
        console.error("Erro ao carregar os dados reais do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-text-muted font-space font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">
          {loading ? "Sincronizando Telemetria..." : "Erro de Conexão..."}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up font-sans text-pt-text">
      <header className="mb-8">
        <h1 className="text-4xl font-sora font-extrabold uppercase tracking-tighter text-pt-white">
          Overview <span className="text-pt-primary">Estatístico</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Painel Esquerdo */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-pt-surface-solid border border-pt-border p-8 relative overflow-hidden group">
            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              <div className="w-24 h-24 bg-pt-bg border border-pt-border flex items-center justify-center relative">
                <ShieldCheck className="w-10 h-10 text-pt-primary drop-shadow-glow-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-sora font-bold uppercase tracking-tighter">{data.clube.nome}</h2>
                <span className="font-space text-[10px] text-pt-bg bg-pt-primary px-2 py-0.5 mt-2 inline-block uppercase tracking-[0.2em] font-bold">
                  {data.clube.pais}
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-pt-surface-bright/30 border border-pt-border text-center">
                <div className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.2em] mb-1">Jogos</div>
                <div className="font-sora text-3xl font-extrabold">{data.estatisticas.total_jogos}</div>
              </div>
              <div className="p-4 bg-pt-primary/10 border border-pt-primary/30 text-center">
                <div className="font-space text-[9px] text-pt-primary uppercase tracking-[0.2em] mb-1">Vitórias</div>
                <div className="font-sora text-3xl font-extrabold text-pt-primary">{data.estatisticas.vitorias}</div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.2em]">Eficiência</span>
                <span className="font-sora text-sm font-extrabold text-pt-primary">{data.estatisticas.aproveitamento}%</span>
              </div>
              <div className="h-1.5 w-full bg-pt-surface-bright overflow-hidden">
                <div className="h-full bg-pt-primary shadow-glow-primary" style={{ width: `${data.estatisticas.aproveitamento}%` }} />
              </div>
            </div>
          </div>
          
          <div className="bg-pt-surface-solid border border-pt-border p-6 flex items-center justify-between group hover:border-pt-primary/50 transition-colors cursor-pointer">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-pt-primary/10 flex items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-pt-primary" />
               </div>
               <div>
                 <h3 className="font-space text-xs font-bold text-pt-white uppercase tracking-[0.1em]">Scouting Avançado</h3>
                 <p className="font-geist text-[10px] text-pt-text-muted">Análise de Performance</p>
               </div>
             </div>
             <span className="font-sora text-pt-primary text-xl">&rarr;</span>
          </div>
        </div>

        {/* Painel Direito */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-pt-surface-solid border border-pt-border p-8 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <Calendar className="w-5 h-5 text-pt-primary" />
                 <h3 className="font-space text-xs font-bold text-pt-text uppercase tracking-[0.2em]">Próximo Confronto</h3>
               </div>
               <span className="font-space text-[9px] text-pt-primary border border-pt-primary/30 px-3 py-1 bg-pt-primary/10 uppercase tracking-[0.2em]">
                 {data.proximo_jogo.competicao}
               </span>
             </div>

             <div className="p-8 bg-pt-surface-bright/20 border border-pt-border">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="text-center md:text-left">
                     <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.3em] mb-1">Adversário</p>
                     <h2 className="font-sora text-4xl font-extrabold uppercase tracking-tighter">
                       {data.proximo_jogo.adversario}
                     </h2>
                     <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-4">
                        <span className="flex items-center gap-1 font-space text-[9px] text-pt-bg bg-pt-primary px-2 py-0.5 font-bold uppercase tracking-[0.1em]">
                          <Activity className="w-3 h-3" /> {data.proximo_jogo.local}
                        </span>
                        <span className="font-geist text-xs text-pt-text-muted">
                          {new Date(data.proximo_jogo.data_hora).toLocaleString('pt-BR')}
                        </span>
                     </div>
                   </div>
                   
                   <div className="hidden md:block w-px h-16 bg-pt-border" />
                   
                   <div className="text-center md:text-right">
                     <p className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.3em] mb-1">Localização</p>
                     <div className="flex items-center justify-center md:justify-end gap-2 font-sora text-lg font-bold">
                       {data.proximo_jogo.estadio} <Trophy className="w-4 h-4 text-pt-primary" />
                     </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-pt-surface-solid border border-pt-border p-8">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-space text-xs font-bold text-pt-text uppercase tracking-[0.2em]">Escalação Projetada</h3>
               <span className="font-geist text-[10px] text-pt-text-muted border border-pt-border px-2 py-1">
                 Fonte: {data.origem_escalacao.toUpperCase()}
               </span>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {data.provavel_escalacao.map((jogador) => (
                 <div key={jogador.jogador_id} className="p-3 bg-pt-surface-bright/30 border border-pt-border flex flex-col items-center text-center">
                   <span className="font-sora text-xs font-bold uppercase tracking-tight text-pt-white">
                     {jogador.nome}
                   </span>
                   <span className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.2em] mt-1">
                     {jogador.posicao}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
