import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ImagePlus, Check, X, Shield, Search } from "lucide-react";
import { api, extractList } from "../services/api";
import Swal from 'sweetalert2';
import { COUNTRIES } from "../data/countries";

export default function RegistroJogadores() {
  const navigate = useNavigate();
  const posicoes = useMemo(
    () => [
      "Goleiro", "Zagueiro", "Lateral Esquerdo", "Lateral Direito",
      "Volante", "Meio-campista", "Meia Atacante",
      "Ponta Esquerda", "Ponta Direita", "Centroavante",
    ],
    []
  );

  const pernas = useMemo(() => ["Destro", "Canhoto", "Ambidestro"], []);

  const [clubes, setClubes] = useState([]);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  const [formData, setFormData] = useState({
    nome: "", cpf: "", data_nascimento: "", peso: "", altura: "",
    nacionalidade: [], clube: "", posicao: [], perna: "",
  });

  useEffect(() => {
    async function fetchClubes() {
      try {
        const response = await api.get("/clubes/");
        setClubes(extractList(response.data));
      } catch (error) {
        console.error("Erro ao buscar clubes:", error);
      }
    }
    fetchClubes();
  }, []);

  function handlePickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFotoPreview(url);
    setFotoFile(file);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegistrar() {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'posicao') {
          const val = formData.posicao;
          if (Array.isArray(val)) data.append(key, val.join(', '));
          else data.append(key, val);
        } else if (key === 'nacionalidade') {
          const val = formData.nacionalidade;
          if (Array.isArray(val)) data.append(key, val.join(', '));
          else data.append(key, val);
        } else {
          data.append(key, formData[key]);
        }
      });
      if (fotoFile) data.append("foto", fotoFile);

      await api.post("/jogadores/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: 'Registrado!',
        text: 'O jogador foi cadastrado com sucesso.',
        icon: 'success',
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#A2FF01',
        confirmButtonText: 'Continuar'
      });

      setFormData({
        nome: "", cpf: "", data_nascimento: "", peso: "", altura: "",
        nacionalidade: [], clube: "", posicao: [], perna: "",
      });
      setFotoPreview(null);
      setFotoFile(null);

    } catch (error) {
      console.error("Erro ao registrar jogador:", error);

      Swal.fire({
        icon: 'error',
        title: 'Erro ao registrar',
        text: 'Verifique se todos os campos estão preenchidos corretamente.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        background: '#0B0B0B',
        color: '#FEFEFE'
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
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Novo Atleta</h1>
            <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">Inclusão de perfil técnico no sistema.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-pt-primary/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-pt-primary/10 transition-colors" />
          
          <div className="flex flex-col items-center relative z-10">
            <div className="relative group/foto">
              <div className="w-48 h-48 rounded-[48px] border-[3px] border-pt-bg overflow-hidden bg-pt-bg flex items-center justify-center shadow-inner ring-1 ring-pt-white/5">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover grayscale-[30%] group-hover/foto:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-pt-white/5 group-hover/foto:text-pt-primary/20 transition-colors">
                    <ImagePlus className="w-10 h-10" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">NO IMAGE</span>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-pt-primary flex items-center justify-center text-pt-bg cursor-pointer shadow-xl shadow-pt-primary/20 hover:scale-110 active:scale-95 transition-all">
                <ImagePlus className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
              </label>
            </div>

            <div className="mt-12 w-full space-y-6">
              <Field label="Nascimento" type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleInputChange} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Peso (kg)" type="number" step="0.1" name="peso" value={formData.peso} onChange={handleInputChange} />
                <Field label="Altura (cm)" type="number" step="1" name="altura" value={formData.altura} onChange={handleInputChange} />
              </div>
              <CountryMultiSelect label="Nacionalidade" value={formData.nacionalidade} onChange={(vals) => setFormData((p) => ({ ...p, nacionalidade: vals }))} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <Shield className="w-32 h-32 text-pt-primary" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <Field label="Nome Completo" placeholder="ID TÉCNICO" name="nome" value={formData.nome} onChange={handleInputChange} />
              <Field label="CPF" placeholder="000.000.000-00" name="cpf" value={formData.cpf} onChange={handleInputChange} />
            </div>

            <div className="relative z-10">
              <SelectField label="Vinculação de Clube" name="clube" value={formData.clube} onChange={handleInputChange}>
                <option value="" disabled>SELECIONAR ENTIDADE</option>
                {clubes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome.toUpperCase()}</option>
                ))}
              </SelectField>
            </div>
          </div>

          <div className="bg-pt-surface border border-pt-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-pt-white/5">
               <Zap className="w-5 h-5 text-pt-primary fill-pt-primary/10" />
               <h3 className="font-black text-white text-xs uppercase tracking-widest italic">Parâmetros de Campo</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end relative z-10">
              <PositionMultiSelect label="Especialidade / Posição" value={formData.posicao} onChange={(vals) => setFormData((p) => ({ ...p, posicao: vals }))} options={posicoes} />
              <PernaSelect label="Domínio de Perna" value={formData.perna} onChange={(v) => setFormData((p) => ({ ...p, perna: v }))} options={pernas} />
            </div>

            <div className="mt-10 pt-6 flex items-center justify-between opacity-30">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pt-primary" />
                  <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em]">Módulo Bio-Tático Ativo</span>
               </div>
               <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] italic">ProTactic Engine v2</span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleRegistrar}
              className="w-full md:w-auto bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 px-16 rounded-[24px] uppercase tracking-widest text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95"
            >
              Confirmar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text", ...props }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 px-6 text-pt-text focus:outline-none focus:border-pt-primary focus:ring-1 focus:ring-pt-primary/20 transition-all shadow-inner tabular-nums"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className="appearance-none w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 pl-6 pr-12 text-pt-text focus:outline-none focus:border-pt-primary focus:ring-1 focus:ring-pt-primary/20 transition-all shadow-inner cursor-pointer"
        >
          {children}
        </select>
        <ChevronDown className="w-5 h-5 text-pt-primary absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

function PositionMultiSelect({ label, value = [], onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const selected = Array.isArray(value) ? value : [];

  function toggle(pos) {
    const exists = selected.includes(pos);
    const next = exists ? selected.filter(p => p !== pos) : [...selected, pos];
    onChange(next);
  }

  return (
    <div className="space-y-2.5 relative">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">{label}</label>
      <div
        className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-3.5 px-4 text-pt-text flex flex-wrap gap-2 items-center justify-between cursor-pointer shadow-inner min-h-[56px]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 && <span className="text-pt-white/10 text-[10px] font-black tracking-widest">DEFINIR...</span>}
          {selected.map(p => (
            <div key={p} className="inline-flex items-center bg-pt-primary/10 border border-pt-primary/20 px-3 py-1 rounded-lg text-[9px] font-black text-pt-primary uppercase tracking-widest">
              {p}
            </div>
          ))}
        </div>
        <ChevronDown className={`w-5 h-5 text-pt-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-30 bottom-full left-0 w-full mb-3 max-h-60 overflow-auto bg-pt-surface border border-pt-primary/20 rounded-3xl p-4 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-1">
            {options.map((o) => {
              const checked = selected.includes(o);
              return (
                <button
                  key={o}
                  onClick={() => toggle(o)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${checked ? 'bg-pt-primary/10 text-pt-primary' : 'hover:bg-pt-white/5 text-pt-text-muted'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{o}</span>
                  {checked && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CountryMultiSelect({ label, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = Array.isArray(value) ? value : [];

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);

  return (
    <div className="space-y-2.5 relative">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">{label}</label>
      <div
        className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-3.5 px-4 text-pt-text flex flex-wrap gap-2 items-center justify-between cursor-pointer shadow-inner min-h-[56px]"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-2">
          {selected.length === 0 && <span className="text-pt-white/10 text-[10px] font-black tracking-widest">DEFINIR...</span>}
          {selected.map(code => (
            <div key={code} className="inline-flex items-center gap-2 bg-pt-white/5 border border-pt-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-pt-text uppercase">
              <span>{countryCodeToEmoji(code)}</span>
              <span className="font-black text-[9px] tracking-widest">{(COUNTRIES.find(c => c.code === code) || { name: code }).code}</span>
            </div>
          ))}
        </div>
        <ChevronDown className={`w-5 h-5 text-pt-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-30 bottom-full left-0 w-full mb-3 max-h-72 overflow-hidden bg-pt-surface border border-pt-primary/20 rounded-[32px] p-4 shadow-2xl animate-in fade-in zoom-in-95 flex flex-col backdrop-blur-xl">
          <div className="relative mb-4">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pt-text-muted w-4 h-4" />
             <input
                className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-pt-primary/40 shadow-inner"
                placeholder="BUSCAR PAÍS..."
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
             />
          </div>
          <div className="flex-1 overflow-auto space-y-1 pr-2">
            {filtered.map((c) => {
              const checked = selected.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={(e) => { e.stopPropagation(); const next = checked ? selected.filter(x => x !== c.code) : [...selected, c.code]; onChange(next); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${checked ? 'bg-pt-primary/10 text-pt-primary' : 'hover:bg-pt-white/5 text-pt-text-muted'}`}
                >
                  <div className="flex items-center gap-3">
                     <span className="text-lg">{countryCodeToEmoji(c.code)}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">{c.name}</span>
                  </div>
                  {checked && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PernaSelect({ label, value = '', onChange, options = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2.5 relative">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">{label}</label>
      <div
        className="w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-3.5 px-6 text-pt-text flex items-center justify-between cursor-pointer shadow-inner min-h-[56px]"
        onClick={() => setOpen(!open)}
      >
        <span className={`text-xs font-black uppercase tracking-widest ${value ? 'text-pt-primary italic' : 'text-pt-white/10'}`}>
          {value || 'SELECIONAR'}
        </span>
        <ChevronDown className={`w-5 h-5 text-pt-primary transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <div className="absolute z-20 bottom-full left-0 w-full mb-3 bg-pt-surface border border-pt-primary/20 rounded-[32px] p-4 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-1">
            {options.map((o) => {
              const active = value === o;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => { onChange(o); setOpen(false); }}
                  className={`w-full text-left flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all ${active ? 'bg-pt-primary text-pt-bg' : 'hover:bg-pt-white/5 text-pt-text-muted'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{o}</span>
                  {active && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function countryCodeToEmoji(cc) {
  if (!cc) return "";
  return cc.toUpperCase().split("").map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join("");
}

const Zap = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" /></svg>;