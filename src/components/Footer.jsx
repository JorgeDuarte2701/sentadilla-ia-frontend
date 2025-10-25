// frontend/src/components/Footer.jsx
// Footer con copyright - Jorge Duarte

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            <span className="font-semibold text-white">© {currentYear}</span>
            {' '}
            <span className="text-teal-400 font-bold">Jorge Duarte</span>
            {' • '}
            <span className="text-gray-500">Universidad Mariano Gálvez</span>
          </div>

          {/* Badge UMG */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-lg">
              <span className="text-teal-400 font-bold text-sm">
                🎓 UMG
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              Sistema de Análisis de Sentadillas
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}