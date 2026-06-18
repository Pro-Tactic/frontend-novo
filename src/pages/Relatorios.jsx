import { useState, useEffect } from "react";
import { api } from "../services/api";
import { getUserId, getUserType } from "../services/auth";
import { FileText, Plus, Search, Eye } from "lucide-react";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#1E1E1E",
  color: "#FFFFFF",
});

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  
  const userId = getUserId();
  const userType = getUserType();
  const isAnalyst = userType === "ANALISTA" || userType === "Analista de Desempenho";

  const [showModal, setShowModal] = useState(false);
  const [relatorioAtivo, setRelatorioAtivo] = useState(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoArquivo, setNovoArquivo] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!novoTitulo || (!novaDescricao && !novoArquivo)) {
      Toast.fire({ icon: "warning", title: "PREENCHA O TÍTULO E AO MENOS O TEXTO OU UM ANEXO." });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("titulo", novoTitulo);
      formData.append("descricao", novaDescricao);
      if (novoArquivo) {
        formData.append("arquivo", novoArquivo);
      }

      const response = await api.post("/api/v1/relatorios/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setRelatorios([response.data, ...relatorios]);
      setShowModal(false);
      setNovoTitulo("");
      setNovaDescricao("");
      setNovoArquivo(null);
      Toast.fire({ icon: "success", title: "RELATÓRIO SALVO COM SUCESSO" });
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "ERRO AO SALVAR RELATÓRIO" });
    } finally {
      setUploading(false);
    }
  };

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
    <div className="animate-fade-up font-sans text-pt-text relative">
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
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pt-primary text-pt-bg font-space font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-pt-primary-dim transition-colors shadow-glow-primary"
            >
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
                   ANÁLISE
                 </span>
                 <span className="font-geist text-[10px] text-pt-text-muted">
                   {new Date(relatorio.data_criacao).toLocaleDateString('pt-BR')}
                 </span>
              </div>
              <h2 className="font-sora text-xl font-bold uppercase tracking-tight text-pt-white mb-2 line-clamp-2">
                {relatorio.titulo}
              </h2>
              <p className="font-geist text-sm text-pt-text-muted line-clamp-3">
                {relatorio.descricao || "Relatório anexado em PDF."}
              </p>
            </div>

            <div className="p-4 border-t border-pt-border bg-pt-surface-bright/20 flex items-center justify-between relative z-10">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-pt-bg border border-pt-border flex items-center justify-center">
                   <span className="font-sora text-[10px] font-bold text-pt-white">A</span>
                 </div>
                 <span className="font-space text-[9px] text-pt-text-muted uppercase tracking-[0.1em]">Analista</span>
               </div>
               
               <button 
                 onClick={() => setRelatorioAtivo(relatorio)}
                 className="flex items-center gap-1.5 font-space text-[10px] font-bold text-pt-primary hover:text-pt-white transition-colors uppercase tracking-[0.1em]"
               >
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

      {/* MODAL DE LEITURA */}
      {relatorioAtivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pt-bg/80 backdrop-blur-sm p-4">
          <div className="bg-pt-surface-solid border border-pt-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-space text-[10px] font-bold border border-pt-primary text-pt-primary px-3 py-1 uppercase tracking-[0.2em]">
                DOSSIÊ CONFIDENCIAL
              </span>
              <span className="font-geist text-sm text-pt-text-muted">
                {new Date(relatorioAtivo.data_criacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <h2 className="font-sora text-3xl font-extrabold uppercase tracking-tighter text-pt-white mb-6">
              {relatorioAtivo.titulo}
            </h2>
            
            {relatorioAtivo.descricao ? (
              <div className="font-geist text-base text-pt-text leading-relaxed whitespace-pre-wrap mb-8">
                {relatorioAtivo.descricao}
              </div>
            ) : (
              <div className="font-geist text-base text-pt-text-muted italic mb-8">
                Este relatório não possui texto detalhado, apenas anexo.
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-pt-border">
              {relatorioAtivo.caminho_arquivo && (
                <a 
                  href={relatorioAtivo.caminho_arquivo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-3 font-space text-[10px] font-bold uppercase tracking-[0.2em] text-pt-bg bg-pt-primary hover:bg-pt-primary-dim transition-colors w-full"
                >
                  ABRIR ANEXO PDF
                </a>
              )}
              <button 
                onClick={() => setRelatorioAtivo(null)}
                className="flex-1 py-3 font-space text-[10px] font-bold uppercase tracking-[0.2em] text-pt-white border border-pt-border hover:bg-pt-surface-bright transition-colors w-full"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pt-bg/80 backdrop-blur-sm p-4">
          <div className="bg-pt-surface-solid border border-pt-border p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <h2 className="font-sora text-2xl font-bold uppercase tracking-tight text-pt-white mb-6">
              Escrever Novo Dossiê
            </h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] block mb-2">Título do Relatório</label>
                <input 
                  type="text" 
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full bg-pt-bg border border-pt-border p-3 text-pt-white focus:outline-none focus:border-pt-primary transition-colors"
                  placeholder="EX: ANÁLISE TÁTICA RIVAL FC"
                  required
                />
              </div>
              <div>
                <label className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] block mb-2">Conteúdo / Parecer Tático</label>
                <textarea 
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full bg-pt-bg border border-pt-border p-4 text-pt-white focus:outline-none focus:border-pt-primary transition-colors resize-none h-64 font-geist leading-relaxed"
                  placeholder="Escreva as observações táticas, pontos fortes, pontos fracos..."
                />
              </div>
              <div>
                <label className="font-space text-[10px] text-pt-text-muted uppercase tracking-[0.2em] block mb-2">Anexar Documento (PDF ou Word)</label>
                <input 
                  type="file" 
                  accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setNovoArquivo(e.target.files[0])}
                  className="w-full font-geist text-sm text-pt-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:font-space file:font-bold file:uppercase file:tracking-[0.2em] file:bg-pt-surface-bright file:text-pt-white hover:file:bg-pt-primary hover:file:text-pt-bg transition-colors cursor-pointer"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 font-space text-[10px] font-bold uppercase tracking-[0.2em] text-pt-text-muted border border-pt-border hover:bg-pt-surface-bright transition-colors w-full"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 py-3 font-space text-[10px] font-bold uppercase tracking-[0.2em] text-pt-bg bg-pt-primary hover:bg-pt-primary-dim transition-colors disabled:opacity-50 w-full"
                >
                  {uploading ? "SALVANDO..." : "SALVAR DOSSIÊ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
