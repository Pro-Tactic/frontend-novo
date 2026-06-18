import { useState, useEffect } from "react";
import { api } from "../services/api";
import { getUserId, getUserType } from "../services/auth";
import { FileText, Plus, Search, Eye } from "lucide-react";

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  
  const userId = getUserId();
  const userType = getUserType();
  const isAnalyst = userType === "ANALISTA";

  useEffect(() => {
    async function loadRelatorios() {
      try {
        const response = await api.get(`/api/v1/relatorios/?id_usuario=${userId}`);
        setRelatorios(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) loadRelatorios();
  }, [userId]);

  const filtrados = relatorios.filter(r => r.titulo.toLowerCase().includes(busca.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-pt-primary/20 border-t-pt-primary rounded-full animate-spin z-10" />
        <p className="mt-6 text-pt-text-muted font-space font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse z-10">
          Decodificando Arquivos Táticos...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up font-sans text-pt-text">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-sora font-extrabold uppercase tracking-tighter text-pt-white">
            Central de <span className="text-pt-primary">Inteligência</span>
          </h1>
          <p className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] mt-2">
            Acervo: {relatorios.length} Relatórios Táticos
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted" />
            <input 
              type="text" 
              placeholder="BUSCAR RELATÓRIO..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-64 bg-pt-surface-solid border-b border-pt-border p-2 pl-10 text-pt-white focus:outline-none focus:border-pt-primary transition-colors"
            />
          </div>
          
          {isAnalyst && (
            <button className="flex items-center gap-2 px-4 py-2 bg-pt-primary text-pt-bg font-space font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-pt-primary-dim transition-colors shadow-glow-primary">
              <Plus className="w-4 h-4" /> NOVO DOSSIÊ
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrados.length > 0 ? filtrados.map((relatorio) => (
          <div key={relatorio.id} className="bg-pt-surface-solid border border-pt-border flex flex-col group hover:border-pt-primary/40 transition-colors relative overflow-hidden">
            
            <div className="p-6 flex-1 relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <span className="font-space text-[9px] font-bold border border-pt-text-muted px-2 py-0.5 text-pt-text-muted uppercase tracking-[0.2em]">
                   {relatorio.tipo || "ANÁLISE"}
                 </span>
                 <span className="font-geist text-[10px] text-pt-text-muted">
                   {new Date(relatorio.data_criacao).toLocaleDateString('pt-BR')}
                 </span>
              </div>
              <h2 className="font-sora text-xl font-bold uppercase tracking-tight text-pt-white mb-2 line-clamp-2">
                {relatorio.titulo}
              </h2>
              <p className="font-geist text-sm text-pt-text-muted line-clamp-3">
                {relatorio.conteudo || "Conteúdo criptografado."}
              </p>
            </div>

            <div className="p-4 border-t border-pt-border bg-pt-surface-bright/20 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-pt-bg border border-pt-border flex items-center justify-center">
                   <span className="font-sora text-[10px] font-bold text-pt-white">A</span>
                 </div>
                 <span className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.1em]">Analista</span>
               </div>
               
               <button className="flex items-center gap-1.5 font-space text-[10px] font-bold text-pt-primary hover:text-pt-white transition-colors uppercase tracking-[0.1em]">
                 <Eye className="w-3 h-3" /> LER
               </button>
            </div>
            
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-pt-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        )) : (
          <div className="col-span-full p-12 text-center text-pt-text-muted font-geist text-sm border border-pt-border bg-pt-surface-solid">
            Nenhum dossiê de inteligência encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
