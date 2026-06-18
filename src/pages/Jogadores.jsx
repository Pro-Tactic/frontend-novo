import { useState, useEffect } from "react";
import { api } from "../services/api";
import { getUserId } from "../services/auth";
import { Search, Filter, Activity } from "lucide-react";

export default function Jogadores() {
  const [jogadores, setJogadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const userId = getUserId();

  useEffect(() => {
    async function loadJogadores() {
      try {
        const response = await api.get(`/api/v1/jogadores/?id_usuario=${userId}`);
        // Assuming response.data is an array of players
        setJogadores(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Erro ao carregar jogadores:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) loadJogadores();
  }, [userId]);

  const filtrados = jogadores.filter(j => {
    const nameToSearch = j.apelido || j.nome_completo || "";
    return nameToSearch.toLowerCase().includes(busca.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-text-muted font-space font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">
          Coletando Dados Físicos...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up font-sans text-pt-text">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-sora font-extrabold uppercase tracking-tighter text-pt-white">
            Matriz de <span className="text-pt-primary">Atletas</span>
          </h1>
          <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mt-2">
            Base de Operações: {jogadores.length} Registros Ativos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted" />
            <input 
              type="text" 
              placeholder="BUSCAR PELO NOME..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-64 bg-pt-surface-solid border-b border-pt-border p-2 pl-10 text-pt-white focus:outline-none focus:border-pt-primary transition-colors"
            />
          </div>
          <button className="p-2 border border-pt-border bg-pt-surface-solid hover:bg-pt-surface-bright transition-colors">
            <Filter className="w-4 h-4 text-pt-white" />
          </button>
        </div>
      </header>

      <div className="bg-pt-surface-solid border border-pt-border">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-pt-border bg-pt-surface-bright/50">
          <div className="col-span-1 font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">Nº</div>
          <div className="col-span-4 font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">Identidade</div>
          <div className="col-span-3 font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">Função</div>
          <div className="col-span-2 font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">Pé Dominante</div>
          <div className="col-span-2 font-space text-[10px] font-bold text-pt-text-muted uppercase tracking-[0.2em] text-right">Status</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-pt-border">
          {filtrados.length > 0 ? filtrados.map((jogador) => (
            <div key={jogador.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-pt-surface-bright/20 transition-colors group">
              <div className="col-span-1 font-sora font-extrabold text-pt-text-muted group-hover:text-pt-white transition-colors">
                {jogador.numero_camisa_clube || "--"}
              </div>
              <div className="col-span-4">
                <div className="font-sora font-bold text-pt-white uppercase">{jogador.apelido || jogador.nome_completo || "Sem Nome"}</div>
                <div className="font-geist text-[10px] text-pt-text-muted">{jogador.nome_completo || "Nome Completo N/A"}</div>
              </div>
              <div className="col-span-3">
                <span className="font-space text-[10px] font-bold text-pt-bg bg-pt-text-muted px-2 py-0.5 uppercase tracking-[0.1em]">
                  {jogador.posicao_principal || "--"}
                </span>
              </div>
              <div className="col-span-2 font-geist text-sm text-pt-text">
                {jogador.perna_boa || "--"}
              </div>
              <div className="col-span-2 text-right">
                <span className="inline-flex items-center gap-1.5 font-space text-[9px] font-bold text-pt-primary border border-pt-primary/30 bg-pt-primary/10 px-2 py-1 uppercase tracking-[0.2em]">
                  <Activity className="w-3 h-3" /> ATIVO
                </span>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-pt-text-muted font-geist text-sm">
              Nenhum registro tático encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
