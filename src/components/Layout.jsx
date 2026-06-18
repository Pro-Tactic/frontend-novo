import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Users, Calendar, FileText, Settings, LogOut, ShieldCheck } from "lucide-react";
import { clearSession, getFirstName, getUserType } from "../services/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const firstName = getFirstName() || "Operador";
  const userType = getUserType();

  const handleLogout = () => {
    MySwal.fire({
      title: "FINALIZAR SESSÃO?",
      text: "Sair do Command Center?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9ffb00",
      cancelButtonColor: "#1c2214",
      confirmButtonText: "<span style='color: #000000; font-weight: 800; font-family: Sora'>CONFIRMAR</span>",
      cancelButtonText: "<span style='color: #dfe5cf; font-weight: 800; font-family: Sora'>CANCELAR</span>",
      background: "#101508",
      color: "#dfe5cf",
    }).then((result) => {
      if (result.isConfirmed) {
        clearSession();
        navigate("/");
      }
    });
  };

  const navItems = [
    { path: "/inicio", icon: <Activity className="w-5 h-5" />, label: "DASHBOARD" },
    { path: "/jogadores", icon: <Users className="w-5 h-5" />, label: "MATRIZ DE ATLETAS" },
    { path: "/partidas", icon: <Calendar className="w-5 h-5" />, label: "CALENDÁRIO TÁTICO" },
    { path: "/relatorios", icon: <FileText className="w-5 h-5" />, label: "INTELIGÊNCIA" },
    { path: "/simulacao", icon: <Activity className="w-5 h-5" />, label: "SIMULAÇÃO" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-pt-bg">
      {/* Sidebar */}
      <aside className="w-72 bg-pt-surface-solid border-r border-pt-border flex flex-col justify-between relative z-20">
        <div>
          {/* Logo / Header */}
          <div className="h-20 flex items-center px-8 border-b border-pt-border bg-pt-surface-bright/20">
            <h1 className="text-2xl font-sora font-extrabold text-pt-text uppercase tracking-tighter">
              Pro<span className="text-pt-primary">Tactic</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 border border-transparent transition-all group ${
                    isActive
                      ? "bg-pt-surface-container-high border-pt-border shadow-glow-primary"
                      : "hover:bg-pt-surface-container hover:border-pt-border/50"
                  }`}
                >
                  <div className={`${isActive ? "text-pt-primary" : "text-pt-text-muted group-hover:text-pt-primary-dim"}`}>
                    {item.icon}
                  </div>
                  <span className={`font-space text-[11px] font-bold tracking-[0.2em] uppercase mt-0.5 ${isActive ? "text-pt-primary" : "text-pt-text-muted group-hover:text-pt-text"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-pt-border bg-pt-surface-container-lowest">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-space text-[10px] font-bold text-pt-text uppercase tracking-[0.1em]">{firstName}</span>
              <span className="font-geist text-xs text-pt-text-muted flex items-center gap-1">
                {userType === "ANALISTA" ? <ShieldCheck className="w-3 h-3 text-pt-blue" /> : <Settings className="w-3 h-3 text-pt-text-muted" />}
                {userType}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-pt-text-muted hover:text-pt-error hover:bg-pt-error/10 border border-transparent hover:border-pt-error/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative h-screen overflow-y-auto overflow-x-hidden">
         {/* Glow ambiental no fundo */}
         <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-20"
              style={{ background: "radial-gradient(circle, var(--pt-blue) 0%, transparent 70%)" }} />
         
         <div className="relative z-10 p-8 lg:p-12 max-w-[1440px] mx-auto">
           <Outlet />
         </div>
      </main>
    </div>
  );
}
