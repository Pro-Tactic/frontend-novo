import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, X, Shield, Globe, Calendar, Trophy, Zap } from "lucide-react";
import { api } from "../services/api";
import Swal from 'sweetalert2';
import { COUNTRIES } from "../data/countries";

export default function RegistroClube() {
  const navigate = useNavigate();
  const [escudoPreview, setEscudoPreview] = useState(null);
  const [escudoFile, setEscudoFile] = useState(null);
  const [nomeClube, setNomeClube] = useState("");
  const [pais, setPais] = useState("");
  const [dataCriacao, setDataCriacao] = useState("");
  const [competicaoSelecionada, setCompeticaoSelecionada] = useState("");
  const [competicoes, setCompeticoes] = useState([]);
  const [competicoesDisponiveis, setCompeticoesDisponiveis] = useState([]);
  const [showCompeticaoModal, setShowCompeticaoModal] = useState(false);

  useEffect(() => {
    async function loadCompeticoes() {
      try {
        const response = await api.get("/competicoes/");
        const lista = response.data?.results || response.data || [];
        setCompeticoesDisponiveis(lista);
      } catch (error) {
        console.error("Erro ao carregar competições:", error);
      }
    }
    loadCompeticoes();
  }, []);

  function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEscudoFile(file);
    const url = URL.createObjectURL(file);
    setEscudoPreview(url);
  }

  function addCompeticao() {
    if (!competicaoSelecionada) return;
    const competicaoObj = competicoesDisponiveis.find(c => String(c.id) === String(competicaoSelecionada));
    if (!competicaoObj) return;
    if (competicoes.find(c => c.id === competicaoObj.id)) return;
    setCompeticoes((prev) => [...prev, competicaoObj]);
    setCompeticaoSelecionada("");
    setShowCompeticaoModal(false);
  }

  function removeCompeticao(id) {
    setCompeticoes((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleRegistrar() {
    const swalConfig = {
      background: '#0B0B0B',
      color: '#FEFEFE',
      confirmButtonColor: '#A2FF01',
      confirmButtonText: 'ENTENDIDO'
    };

    if (!nomeClube.trim()) {
      Swal.fire({ icon: 'warning', title: 'NOME FALTANDO', text: 'O nome da entidade é obrigatório.', ...swalConfig });
      return;
    }
    if (!pais) {
      Swal.fire({ icon: 'warning', title: 'REGIÃO INDEFINIDA', text: 'Selecione o país de origem.', ...swalConfig });
      return;
    }
    if (!dataCriacao) {
      Swal.fire({ icon: 'warning', title: 'DATA INVÁLIDA', text: 'Informe a data de fundação.', ...swalConfig });
      return;
    }
    if (!escudoFile) {
      Swal.fire({ icon: 'warning', title: 'ESCUDO NECESSÁRIO', text: 'A identidade visual é obrigatória.', ...swalConfig });
      return;
    }

    try {
        const formData = new FormData();
        formData.append("nome", nomeClube);
        formData.append("pais", pais);
        formData.append("data_criacao", dataCriacao);
        if (escudoFile) {
            formData.append("escudo", escudoFile);
        }
        competicoes.forEach((competicao) => {
          formData.append("competicoes", competicao.id);
        });

        await api.post("/clubes/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        Swal.fire({
            title: 'CLUBE REGISTRADO!',
            text: 'Entidade tática incorporada com sucesso.',
            icon: 'success',
            background: '#0B0B0B',
            color: '#FEFEFE',
            confirmButtonColor: '#A2FF01',
            confirmButtonText: 'EXCELENTE'
        });

        setNomeClube(""); setPais(""); setDataCriacao(""); setCompeticoes([]);
        setEscudoPreview(null); setEscudoFile(null);

    } catch (error) {
        console.error("Erro ao registrar clube:", error);
        Swal.fire({
            icon: 'error',
            title: 'FALHA NO REGISTRO',
            text: error.response?.data?.detail || 'Não foi possível processar a requisição.',
            background: '#0B0B0B',
            color: '#FEFEFE',
            confirmButtonColor: '#FF4B4B',
        });
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-[18px] bg-pt-surface border border-pt-white/10 text-pt-text-muted hover:text-pt-primary hover:border-pt-primary/30 flex items-center justify-center transition-all shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Nova Entidade</h1>
            <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">Fundação e registro de clube no ecossistema.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* Identidade Visual */}
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-pt-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-pt-primary/10 transition-colors" />
          
          <div className="flex flex-col items-center relative z-10 text-center">
            <h2 className="text-[10px] font-black text-pt-text-muted uppercase tracking-[0.3em] mb-10">Heráldica Oficial</h2>
            
            <div className="relative group/escudo">
              <div className="w-52 h-52 rounded-[60px] border-[3px] border-pt-bg overflow-hidden bg-pt-bg flex items-center justify-center shadow-inner ring-1 ring-pt-white/5">
                {escudoPreview ? (
                  <img src={escudoPreview} alt="Preview" className="w-full h-full object-contain p-6 group-hover/escudo:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-pt-white/5 group-hover/escudo:text-pt-primary/20 transition-colors">
                    <Shield className="w-12 h-12" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">SEM ESCUDO</span>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-14 h-14 rounded-[20px] bg-pt-primary flex items-center justify-center text-pt-bg cursor-pointer shadow-xl shadow-pt-primary/20 hover:scale-110 active:scale-95 transition-all">
                <ImagePlus className="w-6 h-6" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
              </label>
            </div>
            
            <p className="mt-10 text-[9px] font-black text-pt-text-muted/40 uppercase tracking-widest italic leading-relaxed">
              O escudo será utilizado em todos os módulos de <br/> visualização e inteligência de jogo.
            </p>
          </div>
        </div>

        {/* Dados da Entidade */}
        <div className="space-y-8">
          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <Field label="Nome da Entidade" placeholder="P.T. CLUB" value={nomeClube} onChange={setNomeClube} icon={<Zap className="w-4 h-4" />} />
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Região de Origem</label>
                <div className="relative">
                  <select
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="appearance-none w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 pl-12 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all cursor-pointer shadow-inner"
                  >
                    <option value="">Brasil...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>{c.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pt-primary" />
                  <ChevronDown className="w-5 h-5 text-pt-text-muted absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-8 relative z-10">
               <Field label="Fundação" type="date" value={dataCriacao} onChange={setDataCriacao} icon={<Calendar className="w-4 h-4" />} />
            </div>
          </div>

          {/* Competições */}
          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-8">
               <Trophy className="w-5 h-5 text-pt-primary" />
               <h3 className="font-black text-white text-xs uppercase tracking-widest italic">Vínculo de Competições</h3>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex gap-4">
                <div className="flex-1 bg-pt-bg border border-pt-white/10 rounded-2xl py-4 px-6 flex items-center justify-between shadow-inner">
                  <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest italic">
                    {competicoes.length > 0
                        ? `${competicoes.length} COMPRAVADAS`
                        : "NENHUMA COMPETIÇÃO VINCULADA"}
                  </span>
                </div>
                <button
                    onClick={() => setShowCompeticaoModal(true)}
                    className="w-14 h-14 rounded-2xl bg-pt-primary flex items-center justify-center text-pt-bg hover:scale-105 transition-all shadow-lg shadow-pt-primary/10"
                >
                    <Plus className="w-6 h-6" />
                </button>
              </div>

              {competicoes.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                    {competicoes.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pt-primary/10 border border-pt-primary/20 text-pt-primary text-[10px] font-black uppercase tracking-widest">
                        {c.nome}
                        <button onClick={() => removeCompeticao(c.id)} className="hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleRegistrar}
              className="w-full md:w-auto bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 px-16 rounded-[24px] uppercase tracking-widest text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95"
            >
              Confirmar Fundação
            </button>
          </div>
        </div>
      </div>

      {showCompeticaoModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCompeticaoModal(false)}>
          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-8">
               <Trophy className="w-5 h-5 text-pt-primary" />
               <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Vincular Competição</h3>
            </div>
            
            <div className="relative mb-8">
              <select
                value={competicaoSelecionada}
                onChange={(e) => setCompeticaoSelecionada(e.target.value)}
                className="appearance-none w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 px-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all cursor-pointer shadow-inner"
              >
                <option value="">BUSCAR SÉRIE / COPA...</option>
                {competicoesDisponiveis
                  .filter(c => !competicoes.find(comp => comp.id === c.id))
                  .map((comp) => (
                    <option key={comp.id} value={comp.id}>{comp.nome.toUpperCase()}</option>
                  ))
                }
              </select>
              <ChevronDown className="w-5 h-5 text-pt-primary absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCompeticaoModal(false)}
                className="flex-1 py-4 rounded-2xl bg-pt-bg text-pt-text-muted font-black text-[10px] uppercase tracking-widest hover:bg-pt-white/5 transition-all"
              >
                DESCARTAR
              </button>
              <button
                onClick={addCompeticao}
                className="flex-1 py-4 rounded-2xl bg-pt-primary text-pt-bg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-pt-primary/10 hover:opacity-90 active:scale-95 transition-all"
              >
                CONFIRMAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, placeholder, type = "text", value, onChange, icon }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 ${icon ? 'pl-12' : 'px-6'} pr-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner`}
        />
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary">{icon}</div>}
      </div>
    </div>
  );
}

function ChevronDown({ className }) {
   return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
}