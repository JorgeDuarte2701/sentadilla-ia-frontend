// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: ''
  });
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState(''); // ← NUEVO
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // ← NUEVO: Validación básica en tiempo real para email
    if (e.target.name === 'email') {
      validateEmailBasic(e.target.value);
    }
  };

  // ← NUEVO: Validación básica de formato
  const validateEmailBasic = (email) => {
    setEmailWarning('');
    
    if (!email) return;
    
    // Validar formato básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailWarning('⚠️ Formato de email inválido');
      return;
    }
    
    // Advertir sobre dominios sospechosos
    const dominio = email.split('@')[1]?.toLowerCase();
    
    // Lista de dominios comunes válidos
    const dominiosValidos = [
      'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
      'icloud.com', 'protonmail.com', 'live.com', 'msn.com'
    ];
    
    // Si NO es un dominio conocido, advertir (pero permitir continuar)
    if (!dominiosValidos.includes(dominio)) {
      setEmailWarning('⚠️ Asegúrate de que el dominio sea correcto');
    }
    
    // Detectar typos comunes y sugerir
    const typosComunes = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'hotmial.com': 'hotmail.com',
      'yahhoo.com': 'yahoo.com',
      'outlok.com': 'outlook.com'
    };
    
    if (typosComunes[dominio]) {
      const usuario = email.split('@')[0];
      const sugerencia = `${usuario}@${typosComunes[dominio]}`;
      setEmailWarning(`💡 ¿Quisiste decir ${sugerencia}?`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Error al registrar');
      }

      alert('✅ Usuario registrado exitosamente');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">SI</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
              <p className="text-gray-400">Únete a Sentadilla IA</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="juanperez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    emailWarning 
                      ? 'border-yellow-500/50 focus:ring-yellow-500/50' 
                      : 'border-gray-600 focus:ring-teal-500'
                  }`}
                  placeholder="juan@ejemplo.com"
                />
                {/* ← NUEVO: Mostrar warning de email */}
                {emailWarning && (
                  <p className="mt-2 text-xs text-yellow-400 flex items-start gap-1">
                    <span className="mt-0.5">{emailWarning}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-gray-400">Mínimo 6 caracteres</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Registrando...' : 'Crear cuenta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}