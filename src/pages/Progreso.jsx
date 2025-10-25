// frontend/src/pages/Progreso.jsx
// Visualización de progreso y estadísticas de evolución

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Progreso() {
  const [searchParams] = useSearchParams();
  const usuarioIdParam = searchParams.get('usuario_id');
  
  const [stats, setStats] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('semana');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsuario();
    fetchProgreso();
  }, [periodo, usuarioIdParam]);

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

  const fetchProgreso = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      console.log('🔑 Obteniendo progreso con periodo:', periodo);
      console.log('👤 Usuario ID desde URL:', usuarioIdParam);
      
      // Construir URL con usuario_id si existe en los parámetros
      let url = `http://localhost:8000/session/progreso?periodo=${periodo}`;
      if (usuarioIdParam) {
        url += `&usuario_id=${usuarioIdParam}`;
      }
      
      console.log('📡 URL:', url);
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Status:', res.status);
      
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
      console.log('📊 Datos recibidos:', data);
      
      // Validar que tenemos datos
      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error cargando progreso:', err);
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Calcular porcentaje de mejora
  const calcularMejora = (actual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return (((actual - anterior) / anterior) * 100).toFixed(1);
  };

  // Badge de tendencia
  const TendenciaBadge = ({ valor }) => {
    if (valor > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-semibold">
          <span>↗️</span>
          <span>+{valor}%</span>
        </span>
      );
    } else if (valor < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-rose-400 text-sm font-semibold">
          <span>↘️</span>
          <span>{valor}%</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-gray-400 text-sm font-semibold">
        <span>→</span>
        <span>0%</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📈 Tu Progreso
            </h1>
            <p className="text-gray-400">
              Visualiza tu evolución en el tiempo
            </p>
          </div>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="año">Último Año</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando estadísticas...</p>
          </div>
        ) : error ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Error al cargar datos
            </h3>
            <p className="text-rose-400 mb-4">{error}</p>
            <button
              onClick={fetchProgreso}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition"
            >
              Reintentar
            </button>
          </div>
        ) : !stats || stats.total_sesiones === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Sin datos suficientes
            </h3>
            <p className="text-gray-400">
              Entrena más para ver tu progreso
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Sesiones</span>
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stats.total_sesiones || 0}
                </p>
                <TendenciaBadge valor={calcularMejora(stats.total_sesiones, stats.sesiones_anteriores)} />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Repeticiones</span>
                  <span className="text-2xl">🏋️</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stats.total_repeticiones || 0}
                </p>
                <TendenciaBadge valor={calcularMejora(stats.total_repeticiones, stats.repeticiones_anteriores)} />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Calidad Promedio</span>
                  <span className="text-2xl">⭐</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stats.calidad_promedio?.toFixed(1) || '0'}%
                </p>
                <TendenciaBadge valor={calcularMejora(stats.calidad_promedio, stats.calidad_anterior)} />
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Tiempo Total</span>
                  <span className="text-2xl">⏱️</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {stats.tiempo_total ? `${Math.floor(stats.tiempo_total / 60)}m` : '0m'}
                </p>
                <TendenciaBadge valor={calcularMejora(stats.tiempo_total, stats.tiempo_anterior)} />
              </div>
            </div>

            {/* Métricas de Ejecución */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                📊 Métricas de Ejecución
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Profundidad */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Profundidad Promedio</span>
                    <span className="text-teal-400 font-bold">
                      {stats.profundidad_promedio?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.profundidad_promedio || 0) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Mejor: {stats.profundidad_max?.toFixed(2) || '0.00'} • 
                    Anterior: {stats.profundidad_anterior?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* Ángulo Rodilla */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Ángulo Rodilla Promedio</span>
                    <span className="text-purple-400 font-bold">
                      {stats.angulo_rodilla_promedio?.toFixed(1) || '0'}°
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.angulo_rodilla_promedio || 0) / 180 * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Mejor: {stats.angulo_rodilla_min?.toFixed(1) || '0'}° • 
                    Anterior: {stats.angulo_anterior?.toFixed(1) || '0'}°
                  </p>
                </div>

                {/* Inclinación Tronco */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Inclinación Tronco</span>
                    <span className="text-amber-400 font-bold">
                      {stats.inclinacion_tronco_promedio?.toFixed(1) || '0'}°
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.inclinacion_tronco_promedio || 0) / 90 * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Objetivo: {'<45°'} • 
                    Anterior: {stats.inclinacion_anterior?.toFixed(1) || '0'}°
                  </p>
                </div>

                {/* Valgo Rodilla */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">Valgo Rodilla</span>
                    <span className="text-rose-400 font-bold">
                      {stats.valgo_rodilla_promedio?.toFixed(1) || '0'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-red-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(Math.abs(stats.valgo_rodilla_promedio || 0) * 10, 100)}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Objetivo: 0 • 
                    Anterior: {stats.valgo_anterior?.toFixed(1) || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Distribución de Calidad */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                🎯 Distribución de Calidad
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-semibold">Buenas</span>
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stats.repeticiones_buenas || 0}
                  </p>
                  <p className="text-emerald-400 text-sm">
                    {stats.total_repeticiones > 0 
                      ? ((stats.repeticiones_buenas / stats.total_repeticiones) * 100).toFixed(1)
                      : 0}% del total
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 font-semibold">Regulares</span>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stats.repeticiones_regulares || 0}
                  </p>
                  <p className="text-amber-400 text-sm">
                    {stats.total_repeticiones > 0 
                      ? ((stats.repeticiones_regulares / stats.total_repeticiones) * 100).toFixed(1)
                      : 0}% del total
                  </p>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-rose-400 font-semibold">Malas</span>
                    <span className="text-2xl">❌</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stats.repeticiones_malas || 0}
                  </p>
                  <p className="text-rose-400 text-sm">
                    {stats.total_repeticiones > 0 
                      ? ((stats.repeticiones_malas / stats.total_repeticiones) * 100).toFixed(1)
                      : 0}% del total
                  </p>
                </div>
              </div>
            </div>

            {/* Problemas Más Comunes */}
            {stats.problemas_comunes && stats.problemas_comunes.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  ⚠️ Problemas Más Comunes
                </h2>

                <div className="space-y-3">
                  {stats.problemas_comunes.map((problema, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔴</span>
                        <div>
                          <p className="text-white font-semibold">{problema.tipo}</p>
                          <p className="text-gray-400 text-sm">{problema.descripcion}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-rose-400">{problema.ocurrencias}</p>
                        <p className="text-gray-400 text-sm">veces</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                💡 Recomendaciones
              </h2>
              <ul className="space-y-2">
                {stats.calidad_promedio < 70 && (
                  <li className="text-gray-300 flex items-start gap-2">
                    <span>•</span>
                    <span>Trabaja en tu técnica básica antes de aumentar repeticiones</span>
                  </li>
                )}
                {stats.inclinacion_tronco_promedio > 45 && (
                  <li className="text-gray-300 flex items-start gap-2">
                    <span>•</span>
                    <span>Reduce la inclinación del tronco manteniendo el pecho erguido</span>
                  </li>
                )}
                {stats.profundidad_promedio < 0.08 && (
                  <li className="text-gray-300 flex items-start gap-2">
                    <span>•</span>
                    <span>Intenta descender más para mejorar la profundidad</span>
                  </li>
                )}
                {stats.repeticiones_buenas / stats.total_repeticiones > 0.8 && (
                  <li className="text-gray-300 flex items-start gap-2">
                    <span>•</span>
                    <span>¡Excelente progreso! Considera aumentar la dificultad</span>
                  </li>
                )}
                {(!stats.calidad_promedio || stats.calidad_promedio >= 70) && 
                 (!stats.inclinacion_tronco_promedio || stats.inclinacion_tronco_promedio <= 45) &&
                 (!stats.profundidad_promedio || stats.profundidad_promedio >= 0.08) &&
                 (stats.repeticiones_buenas / stats.total_repeticiones <= 0.8) && (
                  <li className="text-gray-300 flex items-start gap-2">
                    <span>•</span>
                    <span>Mantén la constancia para seguir mejorando tu técnica</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 