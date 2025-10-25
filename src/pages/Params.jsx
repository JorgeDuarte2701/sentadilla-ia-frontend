// frontend/src/pages/Params.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
export default function Params() {
  const [params, setParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [claveEditando, setClaveEditando] = useState(null);
  const [valorTemp, setValorTemp] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('all');

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/params', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Error al cargar parámetros');
      
      const data = await res.json();
      setParams(data);
    } catch (err) {
      console.error('Error cargando parámetros:', err);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (param) => {
    setEditando(param.parametro_id);
    setClaveEditando(param.clave);
    setValorTemp(param.valor);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/params/${claveEditando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ valor: valorTemp }),
      });
      
      if (!res.ok) throw new Error('Error al actualizar parámetro');
      
      await fetchParams();
      setEditando(null);
      setClaveEditando(null);
      setValorTemp('');
    } catch (err) {
      console.error('Error actualizando parámetro:', err);
      alert('❌ Error: ' + err.message);
    }
  };

  const handleCancel = () => {
    setEditando(null);
    setClaveEditando(null);
    setValorTemp('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const categorias = [...new Set(params.map(p => p.categoria))];
  const paramsFiltrados = filtroCategoria === 'all' 
    ? params 
    : params.filter(p => p.categoria === filtroCategoria);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header Simple */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              ← Volver
            </Link>
            <h1 className="text-xl font-bold text-white">
              ⚙️ Parámetros del Sistema
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"
          >
            Salir
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Descripción */}
        <div className="mb-8">
          <p className="text-gray-400">
            Configurar umbrales y parámetros de detección
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-gray-400 font-semibold">Filtrar por:</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando parámetros...</p>
          </div>
        ) : paramsFiltrados.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay parámetros
            </h3>
            <p className="text-gray-400">
              {filtroCategoria === 'all' 
                ? 'No hay parámetros registrados en el sistema'
                : `No hay parámetros en la categoría "${filtroCategoria}"`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paramsFiltrados.map((param) => (
              <div
                key={param.parametro_id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">
                        {param.clave}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                        {param.categoria}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                        {param.tipo}
                      </span>
                    </div>
                    
                    {param.descripcion && (
                      <p className="text-gray-400 text-sm mb-4">
                        {param.descripcion}
                      </p>
                    )}

                    {editando === param.parametro_id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type={param.tipo === 'int' || param.tipo === 'float' ? 'number' : 'text'}
                          step={param.tipo === 'float' ? '0.01' : '1'}
                          value={valorTemp}
                          onChange={(e) => setValorTemp(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSave}
                          className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition"
                        >
                          ✓ Guardar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                        >
                          ✗ Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-gray-700 rounded-lg">
                          <span className="text-teal-400 font-mono text-lg font-bold">
                            {param.valor}
                          </span>
                        </div>
                        <button
                          onClick={() => handleEdit(param)}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}