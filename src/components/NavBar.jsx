// frontend/src/components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function NavBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parseando usuario:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  // Detección de roles
  const isAdmin = user && (
    user.rol === 'Administrador' || 
    user.rol === 'ADMIN' ||
    user.role === 'ADMIN' ||
    user.role === 'Administrador'
  );

  const isEntrenador = user && (
    user.rol === 'Entrenador' ||
    user.role === 'Entrenador'
  );

  if (!user) return null;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">SI</span>
            </div>
            <span className="text-white font-bold text-xl">Sentadilla IA</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            
            {/* Botones para Admin */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition text-sm font-medium"
                >
                  🎛️ Admin Panel
                </Link>

                <Link
                  to="/coach/users"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition text-sm font-medium"
                >
                  👥 Gestión Usuarios
                </Link>
              </div>
            )}

            {/* Botones para Entrenador */}
            {isEntrenador && (
              <div className="flex items-center space-x-2">
                <Link
                  to="/coach/users"
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition text-sm font-medium"
                >
                  👥 Mis Usuarios
                </Link>
              </div>
            )}

            {/* User info & logout */}
            <div className="flex items-center space-x-3 border-l border-gray-700 pl-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-gray-400 text-xs">
                  {user.rol || user.role} 
                  {isAdmin && ' 👑'}
                  {isEntrenador && ' 💪'}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition text-sm font-semibold"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}