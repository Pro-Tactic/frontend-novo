import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/auth";
import LoginClube from "./pages/LoginClube";
import LoginAdmin from "./pages/LoginAdmin";
import Layout from "./components/Layout";
import "./index.css";

// Páginas protegidas (lazy)
const Inicio   = lazy(() => import("./pages/Inicio"));
const Registro = lazy(() => import("./pages/Registro"));
const Jogadores = lazy(() => import("./pages/Jogadores"));
const Partidas = lazy(() => import("./pages/Partidas"));
const Relatorios = lazy(() => import("./pages/Relatorios"));

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  if (isAuthenticated()) {
    const userType = localStorage.getItem("user_type");
    return <Navigate to={userType === "ADMIN" ? "/registro" : "/inicio"} replace />;
  }
  return children;
}

function Fallback() {
  return (
    <div className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-pt-primary/30 border-t-pt-primary rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<GuestRoute><LoginClube /></GuestRoute>} />
          <Route path="/admin" element={<GuestRoute><LoginAdmin /></GuestRoute>} />

          {/* Protegidas dentro do Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/inicio"     element={<Inicio />} />
            <Route path="/jogadores"  element={<Jogadores />} />
            <Route path="/partidas"   element={<Partidas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/registro"   element={<Registro />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
