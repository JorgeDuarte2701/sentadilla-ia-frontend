// frontend/src/pages/Login.jsx
import { useState } from "react";
import { API } from "../api/client";
import { auth } from "../auth";
import { useNavigate, Link } from "react-router-dom";
import Footer from '../components/Footer';

export default function Login({ setUser }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await API.post("/auth/login", {
        username_or_email: id.trim(),
        password: pw
      });
      auth.set(data.access_token);
      const me = (await API.get("/auth/me")).data;
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
      nav("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Credenciales inválidas");
    }
  }

  async function handleGuest() {
    setErr("");
    try {
      const { data } = await API.post("/auth/guest");
      auth.set(data.access_token);
      const me = (await API.get("/auth/me")).data;
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
      nav("/dashboard");
    } catch {
      setErr("No se pudo entrar como invitado");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      <div className="flex-grow grid place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-emerald-500/10 p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 grid place-items-center shadow-lg shadow-emerald-500/30">
              <span className="font-extrabold">SI</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold leading-none">Iniciar sesión</h1>
              <p className="text-white/60 text-xs">Accede a tu panel y al histórico</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-white/80">Usuario o Email</label>
              <input
                className="mt-1 w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="tuusuario o correo@ejemplo.com"
                value={id}
                onChange={(e)=>setId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-white/80">Contraseña</label>
              <input
                type="password"
                className="mt-1 w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="••••••••"
                value={pw}
                onChange={(e)=>setPw(e.target.value)}
              />
            </div>

            {err && <p className="text-rose-400 text-sm">{err}</p>}

            <button
              className="w-full px-4 py-2 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition"
            >
              Entrar
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-white/40 text-xs">o</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-sm text-white/70 mt-5 text-center">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-emerald-300 hover:text-emerald-200 font-medium">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}