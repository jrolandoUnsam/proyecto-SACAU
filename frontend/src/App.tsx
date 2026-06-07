import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, useAuth } from "./auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Historial from "./pages/estudiante/Historial";
import Solicitar from "./pages/estudiante/Solicitar";
import MisSolicitudes from "./pages/estudiante/MisSolicitudes";
import Cola from "./pages/evaluador/Cola";
import ResolverSolicitud from "./pages/evaluador/ResolverSolicitud";
import AdminCarreras from "./pages/admin/Carreras";
import AdminMaterias from "./pages/admin/Materias";
import PlanEstudios from "./pages/PlanEstudios";
import Perfil from "./pages/Perfil";

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === "estudiante") return <Navigate to="/estudiante/historial" replace />;
  if (user.rol === "evaluador") return <Navigate to="/evaluador/cola" replace />;
  return <Navigate to="/admin/carreras" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/estudiante/historial" element={
                <ProtectedRoute role="estudiante"><Historial /></ProtectedRoute>
              } />
              <Route path="/estudiante/solicitar" element={
                <ProtectedRoute role="estudiante"><Solicitar /></ProtectedRoute>
              } />
              <Route path="/estudiante/solicitudes" element={
                <ProtectedRoute role="estudiante"><MisSolicitudes /></ProtectedRoute>
              } />

              <Route path="/evaluador/cola" element={
                <ProtectedRoute role="evaluador"><Cola /></ProtectedRoute>
              } />
              <Route path="/evaluador/solicitud/:id" element={
                <ProtectedRoute role="evaluador"><ResolverSolicitud /></ProtectedRoute>
              } />

              <Route path="/admin/carreras" element={
                <ProtectedRoute role="administrador"><AdminCarreras /></ProtectedRoute>
              } />
              <Route path="/admin/materias" element={
                <ProtectedRoute role="administrador"><AdminMaterias /></ProtectedRoute>
              } />

              <Route path="/plan-estudios" element={<PlanEstudios />} />
              <Route path="/perfil" element={
                <ProtectedRoute><Perfil /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
