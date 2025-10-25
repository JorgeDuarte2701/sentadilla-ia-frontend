import { Link } from "react-router-dom";
import { Button, Card } from "../components/UI";
import Footer from '../components/Footer';

export default function Home(){
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-grow max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-4">
              Postura · Rendimiento · Prevención
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Mejora tu técnica de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">sentadilla</span> con IA
            </h1>
            <p className="mt-4 text-white/70">
              Analizamos ángulos críticos y te damos alertas de malas posiciones. Histórico por usuario y panel para administradores.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/login"><Button>Empezar ahora</Button></Link>
              <Link to="/register">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-none">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
          <Card className="p-5">
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-white/10 grid place-items-center">
              <div className="text-center px-6">
                <div className="text-6xl">🏋️‍♂️</div>
                <p className="mt-3 text-white/70">Integraremos tu cámara y el overlay de ángulos aquí (Etapa 2).</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}