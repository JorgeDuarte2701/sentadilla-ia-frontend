// frontend/src/components/Protected.jsx
import { Navigate } from "react-router-dom";

export function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminOnly({ user, children }) {
  // CORREGIDO: Busca 'rol' (español) y acepta 'Administrador' o 'ADMIN'
  if (!user) return <Navigate to="/login" replace />;
  
  const isAdmin = user.rol === "Administrador" || 
                  user.rol === "ADMIN" || 
                  user.role === "ADMIN";
  
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  
  return children;
}