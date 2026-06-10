import { useNavigate } from "react-router-dom";
import { UserPlus, Trophy, Building2, Swords, UserCog, ChevronRight, Zap } from "lucide-react";

export default function Registro() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-700">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[24px] bg-pt-primary/10 flex items-center justify-center border border-pt-primary/30 shadow-xl shadow-pt-primary/10">
                <Zap className="text-pt-primary w-8 h-8" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Registro Central</h1>
        </div>
        <p className="text-pt-text-muted font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            Protocolos de inserção de dados e gestão institucional.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <RegistryCard 
          onClick={() => navigate("/registro/jogadores")}
          icon={<UserPlus className="w-7 h-7" />}
          title="Atletas"
          desc="Inserção de novas unidades táticas e status."
        />

        <RegistryCard 
          onClick={() => navigate("/registro/clube")}
          icon={<Building2 className="w-7 h-7" />}
          title="Clube"
          desc="Gestão de identidades e infraestrutura."
        />

        <RegistryCard 
          onClick={() => navigate("/registro/competicoes")}
          icon={<Trophy className="w-7 h-7" />}
          title="Competições"
          desc="Arquivamento de torneios e ligas."
        />

        <RegistryCard 
          onClick={() => navigate("/registro/tecnico")}
          icon={<UserCog className="w-7 h-7" />}
          title="Comissão"
          desc="Vínculo de novos perfis."
        />

        <RegistryCard 
          onClick={() => navigate("/registro/partidas")}
          icon={<Swords className="w-7 h-7" />}
          title="Partidas"
          desc="Agendamento e protocolos de jogos."
        />

      </div>

      <div className="flex items-center gap-4 opacity-20 justify-center pt-8">
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-pt-white/40" />
      </div>
    </div>
  );
}

function RegistryCard({ onClick, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left bg-pt-surface border border-pt-white/10 rounded-[32px] p-8 hover:border-pt-primary/40 transition-all shadow-2xl relative overflow-hidden active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-pt-primary/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-pt-primary/10 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-16 h-16 rounded-[22px] bg-pt-bg border border-pt-white/10 flex items-center justify-center text-pt-primary mb-8 group-hover:border-pt-primary/30 transition-all shadow-inner group-hover:bg-pt-primary/5">
          {icon}
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
            {title}
          </h2>
          <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest leading-relaxed">
            {desc}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-pt-primary uppercase tracking-[0.2em] transform group-hover:translate-x-2 transition-all">
          Protocolo de Acesso
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}