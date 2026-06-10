import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { fetchNavigation } from "../services/navigation";
import { clearSession } from "../services/auth";
import { api } from "../services/api";
import Swal from "sweetalert2";

import { Home, Users, Target, Activity, Building, Shield, LogOut, Trophy,User, ClipboardList } from "lucide-react";

const ICONS = {
  home: Home,
  users: Users,
  target: Target,
  activity: Activity,
  building: Building,
  shield: Shield,
  trophy: Trophy,
  notas: ClipboardList,
};

function SidebarItem({ item }) {
  const Icon = ICONS[item.icon] || Home;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
          isActive
            ? "bg-pt-primary text-pt-bg font-black shadow-lg shadow-pt-primary/20 scale-[1.02]"
            : "text-pt-text-muted hover:text-pt-primary hover:bg-pt-primary/10",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
          <span className="text-sm tracking-tight">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const [nav, setNav] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const userType = localStorage.getItem("user_type");
  const isAdmin = userType === "Admin";

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Deseja realmente sair?",
      text: "Sua sessão será encerrada e você precisará logar novamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#A2FF01",
      cancelButtonColor: "#1e293b",
      confirmButtonText: "Sim, quero sair",
      cancelButtonText: "Cancelar",
      background: "#0B0B0B",
      color: "#FEFEFE",
      iconColor: "#A2FF01",
      customClass: {
        popup: "rounded-[32px] border border-pt-white/5",
        confirmButton: "rounded-xl text-pt-bg font-black px-8 py-3",
        cancelButton: "rounded-xl text-pt-white font-bold px-8 py-3",
      }
    });

    if (!result.isConfirmed) return;

    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("/logout/", { refresh });
      }
    } catch (e) {
      console.error("Erro ao fazer logout remoto:", e);
    } finally {
      clearSession();
      window.location.replace("/");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchNavigation({ preferCache: true });
        if (!mounted) return;
        setNav(data);
      } catch (err) {
        const status = err?.response?.status;
        const msg = status
          ? `Erro de Navegação (${status})`
          : "Erro de conexão com o servidor";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const renderSidebarLayout = () => {
    const firstName = localStorage.getItem("first_name") || "Treinador";
    const lastName = localStorage.getItem("last_name") || "";
    const clubeNome = localStorage.getItem("clube_nome") || "ProTactic";

    return (
    <div className="min-h-screen bg-pt-bg text-pt-text flex">
      <aside className="w-[260px] h-screen sticky top-0 border-r border-pt-white/10 bg-pt-surface flex flex-col z-50 shadow-2xl">
        <div className="px-6 pt-8 pb-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pt-primary text-pt-bg flex items-center justify-center font-black shadow-lg shadow-pt-primary/20">
              PT
            </div>
            <div className="leading-none text-left">
              <div className="text-sm font-black tracking-[0.2em] text-pt-primary">PROTACTIC</div>
            </div>
          </div>
        </div>

        <nav className="px-3 py-2 flex-1 overflow-y-auto flex flex-col gap-1">
          {loading && (
            <div className="px-4 py-3 flex flex-col gap-3">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-10 w-full bg-pt-bg/40 rounded-xl animate-pulse" />
               ))}
            </div>
          )}
          
          {error && (
            <div className="mx-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          {nav?.items?.map((item) => (
            <SidebarItem key={item.key} item={item} />
          ))}
        </nav>
        
        {/* Rodapé Redesenhado como User Card */}
        <div className="p-4 border-t border-pt-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-pt-white/5 group relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-pt-bg flex items-center justify-center text-pt-primary border border-pt-white/5">
              <User className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-pt-primary truncate">
                {firstName} {lastName}
              </div>
              <div className="text-[9px] text-pt-text-muted font-bold truncate">
                Treinador do {clubeNome}
              </div>
            </div>

            <button
               onClick={handleLogout}
               title="Encerrar Sessão"
               className="w-8 h-8 flex items-center justify-center rounded-lg text-pt-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all ml-auto"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-pt-bg">
        <div className="px-6 lg:px-12 py-10 max-w-[1600px] mx-auto min-h-full">
          {!loading && !nav && !error && (
             <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-pt-white/5 rounded-3xl text-pt-text-muted text-sm font-bold">
                Nada para exibir aqui no momento.
             </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

  const renderAdminLayout = () => (
    <div className="min-h-screen bg-pt-bg text-pt-text">
      <header className="h-[72px] sticky top-0 bg-pt-surface border-b border-pt-white/10 z-50 px-6 lg:px-12 shadow-xl">
        <div className="max-w-[1600px] h-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-left">
            <div className="w-9 h-9 rounded-lg bg-pt-primary text-pt-bg flex items-center justify-center font-black shadow-lg shadow-pt-primary/20">
              PT
            </div>
            <div className="flex flex-col items-start leading-none">
              <div className="text-sm font-black tracking-[0.2em] text-pt-primary">PROTACTIC</div>
              <div className="text-[9px] text-pt-text-muted font-bold uppercase tracking-[0.2em] mt-0.5">Painel Administrativo</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-pt-text-muted hover:text-pt-primary hover:bg-white/5 transition-all group border border-transparent hover:border-pt-white/10"
            >
              <LogOut className="w-4 h-4 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 lg:px-12 py-12 max-w-[1600px] mx-auto min-h-[calc(100vh-72px)] bg-pt-bg">
        <Outlet />
      </main>
    </div>
  );

  return isAdmin ? renderAdminLayout() : renderSidebarLayout();
}