// frontend/src/pages/Historico.jsx
// Histórico de repeticiones con malas ejecuciones y alertas
// ACTUALIZADO: Con header de usuario y debugging mejorado

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';  

export default function Historico() {
  const [searchParams] = useSearchParams();
  const usuarioIdParam = searchParams.get('usuario_id');
  
  const [usuario, setUsuario] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('all');
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [repeticiones, setRepeticiones] = useState([]);
  const [cargandoReps, setCargandoReps] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuario();
    fetchSesiones();
  }, [usuarioIdParam]);

  const API_BASE = 'http://localhost:8000';

  const fetchUsuario = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No hay token');
        return;
      }

      console.log('🔑 Obteniendo datos del usuario...');
      console.log('👤 Usuario ID desde URL:', usuarioIdParam);
      
      // Si hay usuario_id en URL, obtener ese usuario específico
      let url = `${API_BASE}/me`;
      if (usuarioIdParam) {
        url = `${API_BASE}/usuarios/${usuarioIdParam}`;
      }
      
      console.log('📡 URL usuario:', url);
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Status usuario:', res.status);
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error('Error al cargar usuario');
      }
      
      const data = await res.json();
      console.log('👤 Usuario cargado:', data);
      setUsuario(data);
    } catch (err) {
      console.error('Error cargando usuario:', err);
    }
  };

  const fetchSesiones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      console.log('🔑 Obteniendo sesiones...');
      console.log('👤 Usuario ID desde URL:', usuarioIdParam);
      
      // Construir URL con usuario_id si existe en los parámetros
      let url = `${API_BASE}/session/history`;
      if (usuarioIdParam) {
        url += `?usuario_id=${usuarioIdParam}`;
      }
      
      console.log('📡 URL sesiones:', url);
      
      const res = await fetch(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Status sesiones:', res.status);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('📊 Sesiones recibidas:', data);
      
      setSesiones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando sesiones:', err);
      setError(err.message);
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeReps = (data) => {
    const raw = Array.isArray(data) ? data : (data?.items ?? []);
    return raw.map((r, idx) => {
      let calidad = r.calidad;
      if (!calidad) {
        if (r.correcta === true) calidad = 'buena';
        else if (r.correcta === false || r.error_principal) calidad = 'mala';
        else calidad = 'regular';
      }

      const profundidad =
        toNum(r.profundidad_max) ??
        toNum(r.profundidad) ??
        null;

      const anguloRodilla =
        toNum(r.angulo_rodilla_min) ??
        toNum(r.angulo_rodilla) ??
        null;

      const duracion =
        toNum(r.duracion) ??
        toNum(r.tiempo_total) ??
        null;

      return {
        repeticion_id: r.repeticion_id ?? r.rep_id ?? r.id ?? idx,
        numero: r.numero ?? r.numero_repeticion ?? idx + 1,
        timestamp: r.timestamp ?? null,
        calidad,
        profundidad_max: profundidad,
        angulo_rodilla_min: anguloRodilla,
        duracion,
        error_principal: r.error_principal ?? null,
        alertas: Array.isArray(r.alertas) ? r.alertas : [],
      };
    });
  };

  const toNum = (v) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const fetchRepeticiones = async (sesionId) => {
    try {
      setCargandoReps(true);
      setSesionSeleccionada(sesionId);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      console.log('🔑 Obteniendo repeticiones de sesión:', sesionId);
      
      const res = await fetch(`${API_BASE}/session/${sesionId}/repeticiones`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Status repeticiones:', res.status);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log('📊 Repeticiones recibidas:', data);
      
      const normalized = normalizeReps(data);
      setRepeticiones(normalized);
    } catch (err) {
      console.error('Error cargando repeticiones:', err);
      alert('❌ Error al cargar repeticiones: ' + err.message);
      setRepeticiones([]);
    } finally {
      setCargandoReps(false);
    }
  };

  const repeticionesFiltradas = repeticiones.filter((rep) => {
    if (filtroTipo === 'all') return true;
    if (filtroTipo === 'malas') return rep.calidad === 'mala';
    if (filtroTipo === 'criticas') return rep.alertas && rep.alertas.length > 0;
    return true;
  });

  const CalidadBadge = ({ calidad }) => {
    const config = {
      buena: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '✅', label: 'Buena' },
      regular: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: '⚠️', label: 'Regular' },
      mala: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', icon: '❌', label: 'Mala' },
    };
    const c = config[calidad] || config.regular;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
        <span>{c.icon}</span>
        <span>{c.label}</span>
      </span>
    );
  };

  const fmtNum = (v, digits = 2) =>
    typeof v === 'number' && Number.isFinite(v) ? v.toFixed(digits) : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header con info del usuario */}
        {usuario && (
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                {usuario.nombre[0]}{usuario.apellido[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {usuario.nombre} {usuario.apellido}
                </h2>
                <p className="text-gray-400">{usuario.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    usuario.rol === 'Administrador' ? 'bg-rose-500/20 text-rose-400' :
                    usuario.rol === 'Entrenador' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {usuario.rol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Histórico de Ejecuciones</h1>
          <p className="text-gray-400">Revisa tus sesiones y repeticiones con problemas</p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center text-2xl">📅</div>
              <div>
                <p className="text-3xl font-bold text-white">{sesiones.length}</p>
                <p className="text-sm text-gray-400">Sesiones</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">✅</div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {repeticiones.filter((r) => r.calidad === 'buena').length}
                </p>
                <p className="text-sm text-gray-400">Buenas</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">⚠️</div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {repeticiones.filter((r) => r.calidad === 'regular').length}
                </p>
                <p className="text-sm text-gray-400">Regulares</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl">❌</div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {repeticiones.filter((r) => r.calidad === 'mala').length}
                </p>
                <p className="text-sm text-gray-400">Malas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de Sesiones */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">📅 Tus Sesiones</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-400 text-sm">Cargando...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="text-rose-400 text-sm mb-3">{error}</p>
                  <button
                    onClick={fetchSesiones}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Reintentar
                  </button>
                </div>
              ) : sesiones.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-400 text-sm">No tienes sesiones aún</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sesiones.map((sesion) => (
                    <button
                      key={sesion.sesion_id}
                      onClick={() => fetchRepeticiones(sesion.sesion_id)}
                      className={`w-full text-left p-4 rounded-lg transition ${
                        sesionSeleccionada === sesion.sesion_id
                          ? 'bg-teal-500/20 border-2 border-teal-500'
                          : 'bg-gray-700/50 border-2 border-transparent hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Sesión #{sesion.sesion_id}</span>
                        <span className="text-xs text-gray-400">
                          {sesion.fecha ? new Date(sesion.fecha).toLocaleDateString('es-ES') : '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{sesion.total_repeticiones || 0} reps</span>
                        {Number(sesion.repeticiones_malas) > 0 && (
                          <span className="text-rose-400">• {sesion.repeticiones_malas} malas</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detalles de Repeticiones */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">🔍 Repeticiones</h2>

                {repeticiones.length > 0 && (
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="all">Todas</option>
                    <option value="malas">Malas</option>
                    <option value="criticas">Con alertas</option>
                  </select>
                )}
              </div>

              {!sesionSeleccionada ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Selecciona una sesión</h3>
                  <p className="text-gray-400">Elige una sesión de la lista para ver sus repeticiones</p>
                </div>
              ) : cargandoReps ? (
                <div className="text-center py-16">
                  <div className="inline-block w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-400">Cargando repeticiones...</p>
                </div>
              ) : repeticionesFiltradas.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-white mb-2">¡Excelente!</h3>
                  <p className="text-gray-400">
                    {filtroTipo === 'all' 
                      ? 'No hay repeticiones registradas'
                      : 'No hay repeticiones con problemas'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {repeticionesFiltradas.map((rep, idx) => (
                    <div
                      key={rep.repeticion_id ?? `${sesionSeleccionada}-${idx}`}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏋️</span>
                          <div>
                            <h3 className="text-white font-semibold">
                              Repetición #{rep.numero ?? idx + 1}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {rep.timestamp
                                ? new Date(rep.timestamp).toLocaleTimeString('es-ES')
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <CalidadBadge calidad={rep.calidad} />
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-xs mb-1">Profundidad</p>
                          <p className="text-white font-semibold">
                            {fmtNum(rep.profundidad_max, 2)}
                          </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-xs mb-1">Ángulo Rodilla</p>
                          <p className="text-white font-semibold">
                            {typeof rep.angulo_rodilla_min === 'number'
                              ? `${rep.angulo_rodilla_min.toFixed(1)}°`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-xs mb-1">Duración</p>
                          <p className="text-white font-semibold">
                            {typeof rep.duracion === 'number'
                              ? `${rep.duracion.toFixed(1)}s`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Alertas */}
                      {rep.alertas && rep.alertas.length > 0 && (
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                          <p className="text-rose-400 font-semibold text-sm mb-2">
                            ⚠️ Problemas detectados:
                          </p>
                          <ul className="space-y-1">
                            {rep.alertas.map((alerta, i) => (
                              <li key={i} className="text-rose-300 text-sm flex items-start gap-2">
                                <span>•</span>
                                <span>{alerta?.mensaje ?? alerta?.descripcion ?? 'Alerta'}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}