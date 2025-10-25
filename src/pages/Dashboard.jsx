// frontend/src/pages/Dashboard.jsx
// Dashboard principal del usuario con estadísticas hermosas

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener info del usuario
      const resUser = await fetch('http://localhost:8000/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resUser.ok) throw new Error('Error al cargar usuario');
      const dataUser = await resUser.json();
      setUsuario(dataUser);
      
      // Obtener progreso (últimas 2 semanas para el dashboard)
      const resStats = await fetch('http://localhost:8000/session/progreso?periodo=semana', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resStats.ok) throw new Error('Error al cargar estadísticas');
      const dataStats = await resStats.json();
      setStats(dataStats);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6 py-8 flex-grow">
        {/* Header con bienvenida */}
        {usuario && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              ¡Hola, {usuario.nombre}! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Bienvenido a tu panel de entrenamiento
            </p>
          </div>
        )}

        {loading ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Acciones Rápidas */}
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                to="/analysis"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl p-6 transition transform hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      🏋️ Iniciar Entrenamiento
                    </h3>
                    <p className="text-white/80 text-sm">
                      Comienza una nueva sesión con análisis en tiempo real
                    </p>
                  </div>
                  <div className="text-4xl text-white group-hover:translate-x-1 transition">→</div>
                </div>
              </Link>

              <Link
                to="/historico"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl p-6 transition transform hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      📊 Ver Histórico
                    </h3>
                    <p className="text-white/80 text-sm">
                      Revisa tus sesiones anteriores y repeticiones
                    </p>
                  </div>
                  <div className="text-4xl text-white group-hover:translate-x-1 transition">→</div>
                </div>
              </Link>

              <Link
                to="/progreso"
                className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 rounded-xl p-6 transition transform hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-2">
                      📈 Ver Progreso
                    </h3>
                    <p className="text-white/80 text-sm">
                      Analiza tu evolución y estadísticas
                    </p>
                  </div>
                  <div className="text-4xl text-white group-hover:translate-x-1 transition">→</div>
                </div>
              </Link>
            </div>

            {/* Resumen de la semana */}
            {stats ? (
              <>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    📊 Resumen de la Última Semana
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Sesiones */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-2xl">
                          📅
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Sesiones</p>
                          <p className="text-3xl font-bold text-white">
                            {stats.total_sesiones}
                          </p>
                        </div>
                      </div>
                      {stats.sesiones_anteriores > 0 && (
                        <div className={`text-sm font-semibold ${
                          stats.total_sesiones >= stats.sesiones_anteriores
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}>
                          {stats.total_sesiones >= stats.sesiones_anteriores ? '↑' : '↓'}{' '}
                          vs semana anterior
                        </div>
                      )}
                    </div>

                    {/* Total Repeticiones */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl">
                          🏋️
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Repeticiones</p>
                          <p className="text-3xl font-bold text-white">
                            {stats.total_repeticiones}
                          </p>
                        </div>
                      </div>
                      {stats.repeticiones_anteriores > 0 && (
                        <div className={`text-sm font-semibold ${
                          stats.total_repeticiones >= stats.repeticiones_anteriores
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}>
                          {stats.total_repeticiones >= stats.repeticiones_anteriores ? '↑' : '↓'}{' '}
                          vs semana anterior
                        </div>
                      )}
                    </div>

                    {/* Tiempo Total */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
                          ⏱️
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Tiempo Total</p>
                          <p className="text-3xl font-bold text-white">
                            {stats.tiempo_total}m
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {stats.tiempo_total >= 150 ? '¡Objetivo cumplido! 🎉' : 'Sigue así 💪'}
                      </p>
                    </div>

                    {/* Calidad Promedio */}
                    <div className="bg-gray-700/50 rounded-xl p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
                          ⭐
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Calidad</p>
                          <p className="text-3xl font-bold text-white">
                            {stats.calidad_promedio}%
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

                {/* Distribución de calidad */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      🎯 Distribución de Calidad
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-emerald-400 font-semibold flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            Buenas
                          </span>
                          <span className="text-3xl font-bold text-emerald-400">
                            {stats.repeticiones_buenas}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ 
                              width: `${stats.total_repeticiones > 0 
                                ? (stats.repeticiones_buenas / stats.total_repeticiones) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-amber-400 font-semibold flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            Regulares
                          </span>
                          <span className="text-3xl font-bold text-amber-400">
                            {stats.repeticiones_regulares}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ 
                              width: `${stats.total_repeticiones > 0 
                                ? (stats.repeticiones_regulares / stats.total_repeticiones) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-rose-400 font-semibold flex items-center gap-2">
                            <span className="text-xl">❌</span>
                            Malas
                          </span>
                          <span className="text-3xl font-bold text-rose-400">
                            {stats.repeticiones_malas}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-rose-500 h-2 rounded-full"
                            style={{ 
                              width: `${stats.total_repeticiones > 0 
                                ? (stats.repeticiones_malas / stats.total_repeticiones) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      💡 Recomendación
                    </h2>
                    {stats.calidad_promedio >= 80 ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                        <div className="text-4xl mb-3">🎉</div>
                        <h3 className="text-emerald-400 font-bold text-lg mb-2">
                          ¡Excelente trabajo!
                        </h3>
                        <p className="text-gray-300">
                          Tu técnica es muy buena. Considera aumentar la intensidad o el volumen de entrenamiento para seguir progresando.
                        </p>
                      </div>
                    ) : stats.calidad_promedio >= 60 ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <div className="text-4xl mb-3">💪</div>
                        <h3 className="text-amber-400 font-bold text-lg mb-2">
                          Buen progreso
                        </h3>
                        <p className="text-gray-300">
                          Vas por buen camino. Enfócate en corregir los errores más frecuentes para mejorar tu técnica.
                        </p>
                      </div>
                    ) : stats.total_repeticiones === 0 ? (
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                        <div className="text-4xl mb-3">🚀</div>
                        <h3 className="text-cyan-400 font-bold text-lg mb-2">
                          ¡Comienza tu viaje!
                        </h3>
                        <p className="text-gray-300">
                          Inicia tu primera sesión de entrenamiento para comenzar a mejorar tu técnica.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                        <div className="text-4xl mb-3">📚</div>
                        <h3 className="text-rose-400 font-bold text-lg mb-2">
                          Hay margen de mejora
                        </h3>
                        <p className="text-gray-300">
                          Revisa las alertas más comunes en tu histórico y trabaja en los fundamentos de la técnica.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Problemas más comunes */}
                {stats.problemas_comunes && stats.problemas_comunes.length > 0 && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">
                      ⚠️ Áreas de Mejora
                    </h2>
                    <div className="grid md:grid-cols-2 gap-3">
                      {stats.problemas_comunes.slice(0, 4).map((problema, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm">
                              {idx + 1}
                            </div>
                            <span className="text-white font-medium">
                              {problema.descripcion}
                            </span>
                          </div>
                          <span className="text-xl font-bold text-rose-400">
                            {problema.ocurrencias}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🏋️</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  ¡Comienza tu viaje!
                </h3>
                <p className="text-gray-400 mb-6">
                  Aún no tienes datos de entrenamiento. Inicia tu primera sesión para ver tus estadísticas aquí.
                </p>
                <Link
                  to="/analysis"
                  className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition"
                >
                  Iniciar Primera Sesión
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}