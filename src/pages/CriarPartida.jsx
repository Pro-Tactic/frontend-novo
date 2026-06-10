import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, Save, ChevronDown, Zap, Plus, Sword } from "lucide-react";
import Swal from "sweetalert2";

import { api, extractList } from "../services/api"; 

export default function CriarPartida() {
  const navigate = useNavigate();
  
  const [clubes, setClubes] = useState([]);
  const [competicoes, setCompeticoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    mandante: "",
    visitante: "",
    competicao: "",
    local: "",
    data_hora: "",
    placar_mandante: 0,
    placar_visitante: 0
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const [clubesRes, competicoesRes] = await Promise.all([
          api.get("/clubes/"),
          api.get("/competicoes/")
        ]);
        setClubes(extractList(clubesRes.data));
        setCompeticoes(extractList(competicoesRes.data));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const swalConfig = {
      background: '#0B0B0B',
      color: '#FEFEFE',
      confirmButtonColor: '#A2FF01',
      confirmButtonText: 'ENTENDIDO'
    };

    if (formData.mandante === formData.visitante) {
      Swal.fire({
        icon: "warning",
        title: "DADOS INVÁLIDOS",
        text: "O time mandante não pode ser igual ao visitante no campo de batalha.",
        ...swalConfig
      });
      return;
    }

    try {
      await api.post("/partidas/", formData);

      Swal.fire({
        icon: "success",
        title: "PARTIDA REGISTRADA",
        text: "O confronto foi incorporado ao histórico tático.",
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#A2FF01',
        confirmButtonText: 'VAMOS JOGAR'
      });

      navigate("/registro");
    } catch (error) {
      console.error("Erro ao salvar partida:", error);
      Swal.fire({
        icon: "error",
        title: "FALHA NO REGISTRO",
        text: error?.response?.data?.detail || "Erro ao salvar. Verifique se todos os campos estão preenchidos corretamente.",
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#FF4B4B',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-pt-primary gap-4">
        <div className="w-12 h-12 border-4 border-pt-primary/30 border-t-pt-primary rounded-full animate-spin" />
        <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">Sincronizando Ecossistema...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-[18px] bg-pt-surface border border-pt-white/10 text-pt-text-muted hover:text-pt-primary hover:border-pt-primary/30 flex items-center justify-center transition-all shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Novo Confronto</h1>
            <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">Agendamento e registro oficial de partida tática.</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Card Arena: Times e Placar */}
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
             <Sword className="w-[500px] h-[500px] text-pt-primary rotate-12" />
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-12 relative z-10 transition-all">
            
            {/* --- MANDANTE --- */}
            <div className="flex-1 space-y-6">
              <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Host / Mandante</label>
              
              <div className="relative group/field">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <select 
                  name="mandante"
                  value={formData.mandante}
                  onChange={handleChange}
                  required
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-5 pl-14 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all appearance-none shadow-inner cursor-pointer"
                >
                  <option value="">Selecionar...</option>
                  {clubes.map(clube => (
                    <option key={clube.id} value={clube.id}>{clube.nome.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pt-text-muted pointer-events-none" />
              </div>

              <div className="bg-pt-bg/50 border border-pt-white/5 p-6 rounded-3xl space-y-3">
                 <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest ml-1 italic opacity-50">Score ProTactic</label>
                 <input 
                    type="number"
                    min="0"
                    name="placar_mandante"
                    value={formData.placar_mandante}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none text-center text-6xl font-black text-white focus:outline-none tabular-nums"
                 />
              </div>
            </div>

            {/* --- VS --- */}
            <div className="flex flex-col items-center justify-center shrink-0 self-center">
              <div className="w-16 h-16 rounded-full bg-pt-bg flex items-center justify-center border-4 border-pt-surface shadow-2xl relative">
                <div className="absolute inset-0 bg-pt-primary/10 rounded-full blur-xl animate-pulse" />
                <span className="text-xl font-black italic text-pt-primary relative z-10">VS</span>
              </div>
            </div>

            {/* --- VISITANTE --- */}
            <div className="flex-1 space-y-6">
              <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1 text-right">Guest / Visitante</label>
              
              <div className="relative group/field">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary">
                  <Users className="w-5 h-5" />
                </div>
                <select 
                  name="visitante"
                  value={formData.visitante}
                  onChange={handleChange}
                  required
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-5 pl-14 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all appearance-none shadow-inner cursor-pointer"
                >
                  <option value="">Selecionar...</option>
                  {clubes.map(clube => (
                    <option key={clube.id} value={clube.id}>{clube.nome.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pt-text-muted pointer-events-none" />
              </div>

              <div className="bg-pt-bg/50 border border-pt-white/5 p-6 rounded-3xl space-y-3">
                 <label className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest ml-1 italic opacity-50 text-right block">Score ProTactic</label>
                 <input 
                    type="number"
                    min="0"
                    name="placar_visitante"
                    value={formData.placar_visitante}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none text-center text-6xl font-black text-white focus:outline-none tabular-nums"
                 />
              </div>
            </div>

          </div>
        </div>

        {/* Detalhes de Logística */}
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-10">
             <Layout className="w-5 h-5 text-pt-primary" />
             <h3 className="font-black text-white text-xs uppercase tracking-widest italic">Parâmetros de Operação</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Série / Copa</label>
              <div className="relative">
                <select 
                  name="competicao"
                  value={formData.competicao}
                  onChange={handleChange}
                  required
                  className="appearance-none w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 pl-12 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner cursor-pointer"
                >
                  <option value="">FILTRAR COMPETIÇÕES...</option>
                  {competicoes.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.nome.toUpperCase()}</option>
                  ))}
                </select>
                <Trophy className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pt-primary" />
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pt-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Arena / Localidade</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  placeholder="DIGITE O ESTÁDIO"
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 pl-12 pr-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner"
                />
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pt-primary" />
              </div>
            </div>

            <div className="space-y-2.5 md:col-span-2">
              <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Cronograma de Ativação</label>
              <div className="relative">
                <input 
                  type="datetime-local" 
                  name="data_hora"
                  value={formData.data_hora}
                  onChange={handleChange}
                  required
                  className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 px-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all [color-scheme:dark] shadow-inner"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
           <div className="flex items-center gap-3 opacity-30">
              <Zap className="w-4 h-4 text-pt-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-text-muted italic">Partida Detectada em Tempo Real via ProTactic Engine</span>
           </div>
           
           <div className="flex items-center gap-6 w-full md:w-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 md:flex-none text-[10px] font-black text-pt-text-muted uppercase tracking-widest hover:text-white transition-colors"
              >
                Abortar Missão
              </button>
              
              <button
                type="submit"
                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 px-16 rounded-[24px] uppercase tracking-widest text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95 transition-all"
              >
                <Save className="w-5 h-5" />
                Registrar Partida
              </button>
           </div>
        </div>

      </form>
    </div>
  );
}

function Layout({ className, children }) {
    return <div className={className}>{children}</div>;
}