import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./services/auth";

import Login from "./pages/Login";

const AppLayout = lazy(() => import("./layouts/AppLayout"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Registro = lazy(() => import("./pages/Registro"));
const RegistroJogadores = lazy(() => import("./pages/RegistroJogadores"));
const RegistroClube = lazy(() => import("./pages/RegistroClube"));
const RegistroCompeticoes = lazy(() => import("./pages/RegistroCompeticoes"));
const RegistroTecnico = lazy(() => import("./pages/RegistroTecnico"));
const Inicio = lazy(() => import("./pages/Inicio"));
const Elenco = lazy(() => import("./pages/Elenco"));
const Adversario = lazy(() => import("./pages/Adversario"));
const TempoReal = lazy(() => import("./pages/TempoReal"));
const Clube = lazy(() => import("./pages/Clube"));
const CriarPartida = lazy(() => import("./pages/CriarPartida"));
const Notas = lazy(() => import("./pages/Notas"));
const Escalacao = lazy(() => import("./pages/Escalacao"));
const Competicoes = lazy(() => import("./pages/Competicoes"));
const TaticasAvancadas = lazy(() => import("./pages/TaticasAvancadas"));
const Partidas = lazy(() => import("./pages/Partidas"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

import "./index.css"

function Admin() {
  return <h1>Área do Administrador</h1>;
}

function Treinador() {
  return <h1>Área do Treinador</h1>;
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  if (isAuthenticated()) {
    const userType = localStorage.getItem("user_type");
    const target = userType === "Admin" ? "/registro" : "/inicio";
    return <Navigate to={target} replace />;
  }

  return children;
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center">
      Carregando tela...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />
          <Route path="/sobre" element={<Sobre />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/elenco" element={<Elenco />} />
            <Route path="/adversario" element={<Adversario />} />
            <Route path="/tempo-real" element={<TempoReal />} />
            <Route path="/competicoes" element={<Competicoes />} />
            <Route path="/taticas-avancadas" element={<TaticasAvancadas />} />
            <Route path="/clube" element={<Clube />} />
            <Route path="/partidas" element={<Partidas />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/registro/jogadores" element={<RegistroJogadores />} />
            <Route path="/registro/clube" element={<RegistroClube />} />
            <Route path="/registro/competicoes" element={<RegistroCompeticoes />} />
            <Route path="/registro/tecnico" element={<RegistroTecnico />} />
            <Route path="/registro/partidas" element={<CriarPartida />} />
            <Route path="/notas" element={<Notas />} />
            <Route path="/escalacao/:partidaId" element={<Escalacao />} />
          </Route>

          <Route path="/admin" element={<Admin />} />
          <Route path="/treinador" element={<Treinador />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}