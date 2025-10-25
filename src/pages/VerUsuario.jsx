// frontend/src/pages/VerUsuario.jsx
// Página para que Admin vea el histórico y progreso de cualquier usuario

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function VerUsuario() {
  const { usuarioId } = useParams();
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('historico'); // historico | progreso

  useEffect(() => {
    fetchDatos();
  }, [usuarioId]);

  const fetchDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener info del usuario
      const resUser = await fetch(`http://localhost:8000/users/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resUser.ok) throw new Error('Error al cargar usuario');
      const dataUser = await resUser.json();
      setUsuario(dataUser);
      
      // Obtener historial del usuario
      const resHistory = await fetch(`http://localhost:8000/admin/user/${usuarioId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resHistory.ok) throw new Error('Error al cargar historial');
      const dataHistory = await resHistory.json();
      setSesiones(dataHistory);
      
      // Obtener progreso del usuario
      const resProgress = await fetch(`http://localhost:8000/admin/user/${usuarioId}/progreso?periodo=mes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resProgress.ok) throw new Error('Error al cargar progreso');
      const dataProgress = await resProgress.json();
      setStats(dataProgress);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <NavBar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <NavBar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Usuario no encontrado</h2>
          <button
            onClick={() => navigate('/admin/users')}
            className="mt-4 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
          >
            Volver a Usuarios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header con info del usuario */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Volver a Usuarios
          </button>
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                  {usuario.nombre[0]}{usuario.apellido[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {usuario.nombre} {usuario.apellido}
                  </h1>
                  <p className="text-gray-400">{usuario.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.rol === 'Administrador' ? 'bg-rose-500/20 text-rose-400' :
                      usuario.rol === 'Entrenador' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {usuario.rol}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {usuario.activo ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'historico'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            📊 Histórico
          </button>
          <button
            onClick={() => setActiveTab('progreso')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'progreso'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            📈 Progreso
          </button>
        </div>

        {/* Contenido según tab */}
        {activeTab === 'historico' ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Historial de Sesiones
            </h2>
            
            {sesiones.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-400">No tiene sesiones registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sesiones.map(sesion => (
                  <div
                    key={sesion.sesion_id}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold mb-1">
                          Sesión #{sesion.sesion_id}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(sesion.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-teal-400">
                          {sesion.total_repeticiones}
                        </p>
                        <p className="text-gray-400 text-sm">repeticiones</p>
                        {sesion.repeticiones_malas > 0 && (
                          <p className="text-rose-400 text-sm mt-1">
                            {sesion.repeticiones_malas} malas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Estadísticas de progreso */}
            {stats ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-1">Total Sesiones</div>
                    <div className="text-3xl font-bold text-white">{stats.total_sesiones}</div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-1">Repeticiones</div>
                    <div className="text-3xl font-bold text-white">{stats.total_repeticiones}</div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-1">Calidad Promedio</div>
                    <div className="text-3xl font-bold text-white">{stats.calidad_promedio}%</div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="text-gray-400 text-sm mb-1">Tiempo Total</div>
                    <div className="text-3xl font-bold text-white">{stats.tiempo_total}m</div>
                  </div>
                </div>

                {/* Distribución de calidad */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Distribución de Calidad
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                      <div className="text-emerald-400 font-semibold mb-1">Buenas</div>
                      <div className="text-3xl font-bold text-white">{stats.repeticiones_buenas}</div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <div className="text-amber-400 font-semibold mb-1">Regulares</div>
                      <div className="text-3xl font-bold text-white">{stats.repeticiones_regulares}</div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                      <div className="text-rose-400 font-semibold mb-1">Malas</div>
                      <div className="text-3xl font-bold text-white">{stats.repeticiones_malas}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-400">No hay datos de progreso</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}