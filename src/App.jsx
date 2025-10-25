// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "./api/client";
import { auth } from "./auth";
import { Protected, AdminOnly } from "./components/Protected";
import AdminUsers from './pages/AdminUsers';
import AdminPanel from './pages/AdminPanel';
import Params from './pages/Params';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Guest from "./pages/Guest";
import SquatAnalysis from "./pages/SquatAnalysis";
import Historico from './pages/Historico';
import Progreso from './pages/Progreso';
import CoachUsers from './pages/CoachUsers';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      try { 
        setUser(await auth.me(API)); 
      } catch { 
        auth.clear(); 
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        
            <Route 
          path="/coach/users" 
          element={
            <Protected user={user}>
              <CoachUsers />
            </Protected>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <Protected user={user}>
              <Dashboard />
            </Protected>
          } 
        />
        
        <Route 
          path="/analysis" 
          element={
            <Protected user={user}>
              <SquatAnalysis />
            </Protected>
          } 
        />
        
        {/* NUEVAS RUTAS: Histórico y Progreso */}
        <Route 
          path="/historico" 
          element={
            <Protected user={user}>
              <Historico />
            </Protected>
          } 
        />
        
        <Route 
          path="/progreso" 
          element={
            <Protected user={user}>
              <Progreso />
            </Protected>
          } 
        />
        
        {/* Rutas de administrador */}
        <Route 
          path="/admin" 
          element={
            <AdminOnly user={user}>
              <AdminPanel />
            </AdminOnly>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <AdminOnly user={user}>
              <AdminUsers />
            </AdminOnly>
          } 
        />
        
        <Route 
          path="/params" 
          element={
            <AdminOnly user={user}>
              <Params />
            </AdminOnly>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}