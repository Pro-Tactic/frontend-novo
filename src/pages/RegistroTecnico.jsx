import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Shield, ChevronDown, Check, Zap } from "lucide-react";
import Swal from "sweetalert2";
import { api } from "../services/api";

export default function RegistroTecnico() {
  const navigate = useNavigate();
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    clube: "",
  });

  useEffect(() => {
    async function loadClubes() {
      try {
        const response = await api.get("/clubes/");
        const lista = response.data?.results || response.data || [];
        setClubes(lista);
      } catch (error) {
        console.error("Erro ao carregar clubes:", error);
      }
    }

    loadClubes();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const swalConfig = {
      background: '#0B0B0B',
      color: '#FEFEFE',
      confirmButtonColor: '#A2FF01',
      confirmButtonText: 'ENTENDIDO'
    };

    if (!form.username || !form.password || !form.clube) {
      Swal.fire({
        icon: "warning",
        title: "DADOS INCOMPLETOS",
        text: "Login, senha e clube são requisitos mandatórios.",
        ...swalConfig
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/tecnicos/", {
        username: form.username,
        email: form.email || "",
        first_name: form.first_name || "",
        last_name: form.last_name || "",
        password: form.password,
        clube: form.clube,
      });

      Swal.fire({
        icon: "success",
        title: "TÉCNICO INTEGRADO",
        text: "Usuário treinador configurado no sistema ProTactic.",
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#A2FF01',
        confirmButtonText: 'EXCELENTE'
      });

      setForm({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        clube: "",
      });
    } catch (error) {
      const msg =
        error?.response?.data?.username?.[0] ||
        error?.response?.data?.clube?.[0] ||
        error?.response?.data?.detail ||
        "Não foi possível processar o registro tático.";

      Swal.fire({
        icon: "error",
        title: "FALHA NO REGISTRO",
        text: msg,
        background: '#0B0B0B',
        color: '#FEFEFE',
        confirmButtonColor: '#FF4B4B',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="w-12 h-12 rounded-[18px] bg-pt-surface border border-pt-white/10 text-pt-text-muted hover:text-pt-primary hover:border-pt-primary/30 flex items-center justify-center transition-all shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Novo Estrategista</h1>
            <p className="text-pt-text-muted font-bold text-sm uppercase tracking-widest">Atribuição de comando técnico e privilégios de acesso.</p>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 bg-pt-surface border border-pt-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
           <User className="w-52 h-52 text-pt-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <Field label="Identificação / Login" name="username" value={form.username} onChange={handleChange} icon={<User className="w-4 h-4" />} placeholder="TRAINER_LOG" />
          <Field label="Correio Eletrônico" name="email" type="email" value={form.email} onChange={handleChange} icon={<Mail className="w-4 h-4" />} placeholder="COACH@PROTACTIC.COM" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <Field label="Prenome" name="first_name" value={form.first_name} onChange={handleChange} placeholder="NOME" />
          <Field label="Alcunha / Sobrenome" name="last_name" value={form.last_name} onChange={handleChange} placeholder="SOBRENOME" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <Field label="Código de Acesso" name="password" type="password" value={form.password} onChange={handleChange} icon={<Lock className="w-4 h-4" />} />

          <div className="space-y-2.5">
            <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">Clube</label>
            <div className="relative">
              <select
                name="clube"
                value={form.clube}
                onChange={handleChange}
                className="appearance-none w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 pl-12 pr-12 text-pt-text focus:outline-none focus:border-pt-primary transition-all cursor-pointer shadow-inner"
              >
                <option value="">SELECIONAR ENTIDADE...</option>
                {clubes.map((clube) => (
                  <option key={clube.id} value={clube.id}>
                    {clube.nome.toUpperCase()}
                  </option>
                ))}
              </select>
              <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pt-primary" />
              <ChevronDown className="w-5 h-5 text-pt-text-muted absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
           <div className="flex items-center gap-3 opacity-30">
              <Zap className="w-4 h-4 text-pt-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-text-muted italic">Módulo de Autenticação Tática v2.4</span>
           </div>
           
           <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-pt-primary hover:bg-pt-primary/90 text-pt-bg font-black py-5 px-16 rounded-[24px] uppercase tracking-widest text-sm shadow-xl shadow-pt-primary/10 hover:shadow-pt-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : "Vincular Estrategista"}
            {!loading && <Check className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, icon, ...props }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-[10px] font-black text-pt-text-muted uppercase tracking-[0.25em] ml-1">{label}</label>
      <div className="relative">
        <input
          className={`w-full bg-pt-bg border border-pt-white/10 rounded-2xl py-4 ${icon ? 'pl-12' : 'px-6'} pr-6 text-pt-text focus:outline-none focus:border-pt-primary transition-all shadow-inner`}
          {...props}
        />
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-pt-primary">{icon}</div>}
      </div>
    </div>
  );
}
