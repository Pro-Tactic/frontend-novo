import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/auth";
import LoginClube from "./pages/LoginClube";
import LoginAdmin from "./pages/LoginAdmin";
import "./index.css";

// Páginas protegidas (lazy)
const Inicio   = lazy(() => import("./pages/Inicio"));
const Registro = lazy(() => import("./pages/Registro"));

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

          {/* Protegidas */}
          <Route path="/inicio"   element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
          <Route path="/registro" element={<ProtectedRoute><Registro /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
