import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Trophy, Globe, Layout, Users2, DollarSign, Award, Zap, Check } from "lucide-react";
import { api } from "../services/api";
import Swal from 'sweetalert2';
import { COUNTRIES } from "../data/countries";
import { CONTINENTS } from "../data/continents";
import { BRAZIL_REGIONS } from "../data/brazilRegions";
import { BRAZIL_STATES } from "../data/brazilStates";

export default function RegistroCompeticoes() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "", tamanho: "", localidade: "", tipo_participantes: "",
    divisao: "", tipo_formato: "", qtd_participantes: "",
    tem_trofeu: false, tem_premiacao_financeira: false,
    valor_premiacao: "", garante_vaga: false, competicao_destino: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'tamanho' ? { localidade: '' } : {}),
    }));
  };

  const handleCheckbox = (name, checked) => {
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  async function handleRegistrar() {
    const swalConfig = {
      background: '#0B0B0B',
      color: '#FEFEFE',
      confirmButtonColor: '#A2FF01',
      confirmButtonText: 'ENTENDIDO'
    };

    try {
      const payload = {
        nome: form.nome,
        tamanho: form.tamanho,
        localidade: form.localidade || null,
        tipo_participantes: form.tipo_participantes,
        divisao: form.divisao || null,
        tipo_formato: form.tipo_formato || null,
        qtd_participantes: Number(form.qtd_participantes || 0),
      };

      await api.post("/competicoes/", payload);
      
      Swal.fire({
        title: 'COMPETIÇÃO REGISTRADA!',
        text: 'O campeonato foi incorporado ao sistema tático.',
        icon: 'success',
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#A2FF01',
        confirmButtonText: 'EXCELENTE'
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'FALHA NO REGISTRO',
        text: error.response?.data?.detail || 'Não foi possível cadastrar a competição.',
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#FF4B4B',
      });
    }
  }

  const labelLocalidade =
    form.tamanho === "Continental" ? "Continente"
      : form.tamanho === "Nacional" ? "País"
      : form.tamanho === "Regional" ? "Região (Brasil)"
      : form.tamanho === "Estadual" ? "Estado (Brasil)"
      : "";

  const localidadeOptions =
    form.tamanho === "Continental"
      ? CONTINENTS
      : form.tamanho === "Nacional"
      ? COUNTRIES.map((country) => country.name)
      : form.tamanho === "Regional"
      ? BRAZIL_REGIONS
      : form.tamanho === "Estadual"
      ? BRAZIL_STATES
      : [];

  const placeholderLocalidade =
    form.tamanho === "Mundial"
      ? "NÃO APLICÁVEL"
      : !form.tamanho
      ? "AGUARDANDO TAMANHO..."
      : "SELECIONAR REGIÃO";

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
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Novo Torneio</h1>
            <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">Configuração de parâmetros para competições oficiais.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Lado Esquerdo - Parâmetros Técnicos */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <Trophy className="w-40 h-40 text-pt-primary" />
              </div>

              <div className="relative z-10">
                <Field label="Identificação da Competição" placeholder="EX: UEFA CHAMPIONS LEAGUE" name="nome" value={form.nome} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <SelectField label="Escala Territorial" name="tamanho" value={form.tamanho} onChange={handleChange}>
                  <option value="" disabled>SELECIONAR...</option>
                  <option>Mundial</option>
                  <option>Continental</option>
                  <option>Nacional</option>
                  <option>Regional</option>
                  <option>Estadual</option>
                </SelectField>

                <SelectField
                  label={labelLocalidade || "Localidade Específica"}
                  name="localidade"
                  value={form.localidade}
                  onChange={handleChange}
                  disabled={form.tamanho === "Mundial" || !form.tamanho}
                >
                  <option value="">{placeholderLocalidade}</option>
                  {localidadeOptions.map((item) => (
                    <option key={item} value={item}>{item.toUpperCase()}</option>
                  ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <SelectField label="Categorização de Ligas" name="tipo_participantes" value={form.tipo_participantes} onChange={handleChange}>
                  <option value="" disabled>SELECIONAR...</option>
                  <option>Seleções</option>
                  <option>Clubes</option>
                </SelectField>

                <SelectField label="Hierarquia / Divisão" name="divisao" value={form.divisao} onChange={handleChange}>
                  <option value="" disabled>SELECIONAR...</option>
                  <option>1ª Divisão</option>
                  <option>2ª Divisão</option>
                  <option>3ª Divisão</option>
                  <option>4ª Divisão</option>
                  <option>5ª Divisão</option>
                  <option>Sem Divisão</option>
                </SelectField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <SelectField label="Formato de Disputa" name="tipo_formato" value={form.tipo_formato} onChange={handleChange}>
                  <option value="" disabled>SELECIONAR...</option>
                  <option>Torneio</option>
                  <option>Liga</option>
                  <option>Outro</option>
                </SelectField>

                <Field label="Quotas de Participação" placeholder="20" type="number" name="qtd_participantes" value={form.qtd_participantes} onChange={handleChange} />
              </div>
           </div>
        </div>

        {/* Lado Direito - Recompensas e Fluxo */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl flex flex-col space-y-8 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-2">
                 <Award className="w-5 h-5 text-pt-primary" />
                 <h3 className="font-black text-white text-xs uppercase tracking-widest italic">Incentivos & Glória</h3>
              </div>

              <div className="space-y-4">
                <Checkbox label="Troféu Físico / Digital" name="tem_trofeu" checked={form.tem_trofeu} onChange={(c) => handleCheckbox('tem_trofeu', c)} />
                <Checkbox label="Aporte Financeiro" name="tem_premiacao_financeira" checked={form.tem_premiacao_financeira} onChange={(c) => handleCheckbox('tem_premiacao_financeira', c)} />
                
                {form.tem_premiacao_financeira && (
                  <div className="pt-2 animate-in slide-in-from-left-2 duration-300">
                    <Field label="Montante (USD/BRL)" placeholder="0.00" type="number" name="valor_premiacao" value={form.valor_premiacao} onChange={handleChange} icon={<DollarSign className="w-4 h-4" />} />
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-pt-white/5 space-y-4">
                  <Checkbox label="Vaga em Outras Séries" name="garante_vaga" checked={form.garante_vaga} onChange={(c) => handleCheckbox('garante_vaga', c)} />
                  {form.garante_vaga && (
                    <div className="animate-in slide-in-from-left-2 duration-300">
                      <SelectField label="Competição Destino">
                        <option value="" disabled>EM DESENVOLVIMENTO...</option>
                      </SelectField>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-pt-white/5 opacity-30 flex items-center justify-between">
                 <span className="text-[9px] font-black uppercase tracking-widest">Módulo PT-Comp v1.2</span>
                 <Zap className="w-3 h-3 text-pt-primary" />
              </div>
           </div>

           <div className="pt-4">
              <button
                onClick={handleRegistrar}
                className="w-full bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 rounded-[24px] uppercase tracking-widest text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Ativar Competição
                <Check className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text", icon, ...props }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 ${icon ? 'pl-12' : 'px-6'} pr-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner tabular-nums`}
          {...props}
        />
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary">{icon}</div>}
      </div>
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="space-y-2.5 relative">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">{label}</label>
      <div className="relative">
        <select
          className="appearance-none w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 pl-6 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all cursor-pointer shadow-inner disabled:opacity-40 disabled:cursor-not-allowed"
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="w-5 h-5 text-pt-primary absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

function Checkbox({ label, checked, onChange, name }) {
  return (
    <label className="flex items-center gap-4 cursor-pointer group bg-pt-bg/30 border border-pt-white/5 p-4 rounded-2xl hover:border-pt-primary/30 transition-all">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          name={name}
        />
        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${checked ? 'bg-pt-primary border-pt-primary shadow-[0_0_10px_rgba(162,255,1,0.2)]' : 'border-pt-white/10 group-hover:border-pt-primary/40'}`}>
           {checked && <Check className="w-4 h-4 text-pt-bg" />}
        </div>
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${checked ? 'text-white' : 'text-pt-text-muted'}`}>
        {label}
      </span>
    </label>
  );
}