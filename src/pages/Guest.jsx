import { Card } from "../components/UI";

export default function Guest() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Card className="p-6">
        <h2 className="text-xl font-bold">Modo invitado</h2>
        <p className="text-white/70 mt-2">Vista de demostración sin guardar histórico.</p>
      </Card>
    </div>
  );
}
