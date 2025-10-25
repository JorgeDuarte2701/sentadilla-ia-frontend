// frontend/src/pages/AdminPanel.jsx
// Panel de administración con estadísticas globales del sistema

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Error al cargar estadísticas');
      
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      alert('❌ Error al cargar estadísticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎛️ Panel de Administración
          </h1>
          <p className="text-gray-400">
            Estadísticas globales del sistema
          </p>
        </div>

        {loading ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando estadísticas...</p>
          </div>
        ) : !stats ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Error al cargar datos
            </h3>
            <p className="text-gray-400">No se pudieron obtener las estadísticas</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Accesos Rápidos */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/admin/users"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl p-6 transition transform hover:scale-[1.02] shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      👥 Gestión de Usuarios
                    </h3>
                    <p className="text-white/80 text-sm">
                      Crear, editar y administrar usuarios del sistema
                    </p>
                  </div>
                  <div className="text-4xl text-white">→</div>
                </div>
              </Link>

              <Link
                to="/params"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl p-6 transition transform hover:scale-[1.02] shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      ⚙️ Parámetros del Sistema
                    </h3>
                    <p className="text-white/80 text-sm">
                      Configurar umbrales y parámetros de detección
                    </p>
                  </div>
                  <div className="text-4xl text-white">→</div>
                </div>
              </Link>
            </div>

            {/* Estadísticas Principales */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                📊 Estadísticas Generales
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Usuarios */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-2xl">
                      👥
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Usuarios</p>
                      <p className="text-3xl font-bold text-white">
                        {stats.total_usuarios}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400">
                      ✓ {stats.usuarios_activos} activos
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-rose-400">
                      ✗ {stats.usuarios_inactivos} inactivos
                    </span>
                  </div>
                </div>

                {/* Total Sesiones */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl">
                      📅
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Sesiones</p>
                      <p className="text-3xl font-bold text-white">
                        {stats.total_sesiones}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {stats.sesiones_hoy} sesiones hoy
                  </p>
                </div>

                {/* Total Repeticiones */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
                      🏋️
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Repeticiones</p>
                      <p className="text-3xl font-bold text-white">
                        {stats.total_repeticiones}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {stats.repeticiones_hoy} hoy
                  </p>
                </div>

                {/* Calidad Promedio */}
                <div className="bg-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
                      ⭐
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Calidad Global</p>
                      <p className="text-3xl font-bold text-white">
                        {stats.calidad_promedio?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.calidad_promedio || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución por Roles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  👤 Usuarios por Rol
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔴</span>
                      <span className="text-white font-semibold">Administradores</span>
                    </div>
                    <span className="text-2xl font-bold text-rose-400">
                      {stats.usuarios_por_rol?.Administrador || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🟡</span>
                      <span className="text-white font-semibold">Entrenadores</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-400">
                      {stats.usuarios_por_rol?.Entrenador || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🟢</span>
                      <span className="text-white font-semibold">Usuarios</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">
                      {stats.usuarios_por_rol?.Usuario || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  📈 Actividad Reciente
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Última Semana</span>
                      <span className="text-white font-bold">
                        {stats.sesiones_ultima_semana} sesiones
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((stats.sesiones_ultima_semana / stats.total_sesiones) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Último Mes</span>
                      <span className="text-white font-bold">
                        {stats.sesiones_ultimo_mes} sesiones
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((stats.sesiones_ultimo_mes / stats.total_sesiones) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Usuarios Activos (últimos 7 días)</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.usuarios_activos_semana}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Usuarios */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                🏆 Usuarios Más Activos
              </h2>
              
              {stats.top_usuarios && stats.top_usuarios.length > 0 ? (
                <div className="space-y-3">
                  {stats.top_usuarios.map((user, idx) => (
                    <div
                      key={user.usuario_id}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {user.nombre} {user.apellido}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-teal-400">
                          {user.total_sesiones}
                        </p>
                        <p className="text-gray-400 text-sm">sesiones</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-400">No hay datos suficientes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}