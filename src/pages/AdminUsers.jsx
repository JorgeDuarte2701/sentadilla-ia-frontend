// frontend/src/pages/AdminUsers.jsx
// VERSIÓN COMPLETA adaptada a tu backend

import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'Usuario',
    activo: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Error al cargar usuarios');
      
      const data = await res.json();
      
      // Formatear datos para compatibilidad con tu backend
      const formattedUsers = data.map(u => ({
        id: u.usuario_id || u.id,
        username: u.username,
        email: u.email,
        nombre: u.nombre,
        apellido: u.apellido || '',
        rol: u.rol,
        activo: u.activo !== undefined ? u.activo : true
      }));
      
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      alert('❌ Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  // ==================== CREAR USUARIO ====================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido,
          rol: formData.rol
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al crear usuario');
      }

      alert('✅ Usuario creado exitosamente');
      closeModal();
      fetchUsers();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  // ==================== EDITAR USUARIO ====================
  const handleEditUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Preparar datos (solo enviar los que cambiaron)
      const updateData = {
        username: formData.username,
        email: formData.email,
        nombre: formData.nombre,
        apellido: formData.apellido,
        rol: formData.rol,
        activo: formData.activo
      };
      
      // Solo incluir password si se cambió
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }
      
      const res = await fetch(`http://localhost:8000/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al editar usuario');
      }

      alert('✅ Usuario actualizado exitosamente');
      closeModal();
      fetchUsers();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  // ==================== ELIMINAR USUARIO ====================
  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al eliminar usuario');
      }

      alert('✅ Usuario eliminado exitosamente');
      fetchUsers();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  // ==================== ACTIVAR/DESACTIVAR ====================
  const toggleUserActive = async (userId, currentStatus, username) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} al usuario "${username}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !currentStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Error al cambiar estado');
      }

      alert(`✅ Usuario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
      fetchUsers();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  // ==================== MODAL ====================
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol: 'Usuario',
      activo: true
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // No mostramos la contraseña
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      activo: user.activo
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol: 'Usuario',
      activo: true
    });
  };

  // ==================== FILTROS ====================
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // ==================== ESTADÍSTICAS ====================
  const stats = {
    total: users.length,
    admins: users.filter(u => u.rol === 'Administrador').length,
    usuarios: users.filter(u => u.rol === 'Usuario').length,
    invitados: users.filter(u => u.rol === 'Entrenador').length,
    activos: users.filter(u => u.activo).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              👥 Administración de Usuarios
            </h1>
            <p className="text-gray-400">
              Gestiona los usuarios del sistema
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition font-semibold shadow-lg transform hover:scale-105"
          >
            ➕ Crear Usuario
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-teal-500/50 transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-gray-400">Total Usuarios</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
                👑
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.admins}</p>
                <p className="text-sm text-gray-400">Administradores</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.usuarios}</p>
                <p className="text-sm text-gray-400">Usuarios</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.activos}</p>
                <p className="text-sm text-gray-400">Activos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administradores</option>
            <option value="Usuario">Usuarios</option>
            <option value="Invitado">Invitados</option>
          </select>
        </div>

        {/* Tabla de Usuarios */}
        {loading ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-20 text-center">
            <div className="text-6xl mb-4 opacity-30">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-400">
              Intenta ajustar los filtros o crear un nuevo usuario
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {user.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-white">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.nombre} {user.apellido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          user.rol === 'Administrador' 
                            ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' :
                          user.rol === 'Usuario' 
                            ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' :
                            'bg-gray-700 text-gray-300 border border-gray-600'
                        }`}>
                          {user.rol === 'Administrador' && '👑 '}
                          {user.rol === 'Usuario' && '👤 '}
                          {user.rol === 'Invitado' && '👻 '}
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          user.activo 
                            ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30' 
                            : 'bg-rose-900/50 text-rose-300 border-rose-500/30'
                        }`}>
                          {user.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 bg-gray-700 hover:bg-blue-600 text-white rounded-lg transition"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => toggleUserActive(user.id, user.activo, user.username)}
                            className="p-2 bg-gray-700 hover:bg-amber-600 text-white rounded-lg transition"
                            title={user.activo ? 'Desactivar' : 'Activar'}
                          >
                            {user.activo ? '⏸️' : '▶️'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 bg-gray-700 hover:bg-rose-600 text-white rounded-lg transition"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white text-xl transition"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={editingUser ? handleEditUser : handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Usuario *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    minLength={6}
                    placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Usuario">👤 Usuario</option>
                    <option value="Administrador">👑 Administrador</option>
                    <option value="Entrenador">👻 Entranador</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-gray-300 cursor-pointer">
                  Usuario activo
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition"
                >
                  {editingUser ? '💾 Guardar Cambios' : '✅ Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}