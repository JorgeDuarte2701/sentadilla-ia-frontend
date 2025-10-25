// frontend/src/pages/CoachUsers.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function CoachUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [vistaActual, setVistaActual] = useState('cards'); // 'cards' o 'lista'
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, [busqueda]);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8000/coach/users';
      
      if (busqueda.trim()) {
        url += `?q=${encodeURIComponent(busqueda)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 403) {
          alert('❌ No tienes permisos para ver usuarios');
          navigate('/dashboard');
          return;
        }
        throw new Error('Error al cargar usuarios');
      }

      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error('Error:', err);
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verProgreso = (usuarioId) => {
    navigate(`/progreso?usuario_id=${usuarioId}`);
  };

  const verHistorico = (usuarioId) => {
    navigate(`/historico?usuario_id=${usuarioId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Mis Usuarios</h1>
            </div>
            <p className="text-gray-400">Supervisa el progreso de tus usuarios asignados</p>
          </div>

          {/* Controles */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, apellido, email, usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
            </div>

            {/* Botones de vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setVistaActual('cards')}
                className={`px-4 py-2 rounded-lg transition ${
                  vistaActual === 'cards'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                🎴 Cards
              </button>
              <button
                onClick={() => setVistaActual('lista')}
                className={`px-4 py-2 rounded-lg transition ${
                  vistaActual === 'lista'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                📋 Lista
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">👥</div>
                <div>
                  <p className="text-3xl font-bold text-white">{usuarios.length}</p>
                  <p className="text-gray-400 text-sm">Total Usuarios</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {usuarios.filter(u => u.total_sesiones > 0).length}
                  </p>
                  <p className="text-gray-400 text-sm">Activos</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📊</div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {usuarios.reduce((sum, u) => sum + (u.total_sesiones || 0), 0)}
                  </p>
                  <p className="text-gray-400 text-sm">Total Sesiones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de usuarios */}
          {usuarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <p className="text-gray-400 text-lg">No se encontraron usuarios</p>
              <p className="text-gray-500 text-sm mt-2">
                {busqueda ? 'Intenta con otra búsqueda' : 'No hay usuarios asignados'}
              </p>
            </div>
          ) : vistaActual === 'cards' ? (
            // Vista de Cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usuarios.map((user) => (
                <div
                  key={user.usuario_id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition group"
                >
                  {/* Avatar y nombre */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {user.nombre?.[0]}{user.apellido?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {user.nombre} {user.apellido}
                      </h3>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                    <div className="text-2xl">
                      {user.activo ? '✅' : '⛔'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{user.total_sesiones || 0}</p>
                      <p className="text-gray-400 text-xs">Sesiones</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-white">{user.total_repeticiones || 0}</p>
                      <p className="text-gray-400 text-xs">Reps</p>
                    </div>
                    <div className={`${getScoreBg(user.promedio_score || 0)} border rounded-lg p-3 text-center`}>
                      <p className={`text-2xl font-bold ${getScoreColor(user.promedio_score || 0)}`}>
                        {(user.promedio_score || 0).toFixed(1)}
                      </p>
                      <p className="text-gray-400 text-xs">Score</p>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => verProgreso(user.usuario_id)}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition text-sm font-semibold"
                    >
                      📊 Progreso
                    </button>
                    <button
                      onClick={() => verHistorico(user.usuario_id)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition text-sm font-semibold"
                    >
                      📅 Histórico
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista de Lista
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Usuario</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Sesiones</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Repeticiones</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((user, index) => (
                    <tr
                      key={user.usuario_id}
                      className={`border-t border-gray-700 hover:bg-gray-700/50 transition ${
                        index % 2 === 0 ? 'bg-gray-800/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.nombre?.[0]}{user.apellido?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.nombre} {user.apellido}
                            </p>
                            <p className="text-gray-400 text-sm">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-semibold">{user.total_sesiones || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-semibold">{user.total_repeticiones || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${getScoreColor(user.promedio_score || 0)}`}>
                          {(user.promedio_score || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => verProgreso(user.usuario_id)}
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-sm transition"
                          >
                            📊
                          </button>
                          <button
                            onClick={() => verHistorico(user.usuario_id)}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition"
                          >
                            📅
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}