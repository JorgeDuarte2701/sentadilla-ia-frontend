// frontend/src/pages/SquatAnalysis.jsx
import { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function SquatAnalysis() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const wsRef = useRef(null);
  const isActiveRef = useRef(false); // ← NUEVO: ref para controlar el envío
  const sendIntervalRef = useRef(null); // ← NUEVO: guardar intervalo
  
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [serieId, setSerieId] = useState(null);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [errors, setErrors] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [cameraError, setCameraError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState('UP');

  // ============ DIBUJAR ESQUELETO ============
  const drawSkeleton = (landmarks) => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !landmarks || landmarks.length === 0) {
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#00ff00';
    ctx.fillStyle = '#00ff00';
    ctx.lineWidth = 3;

    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [27, 31],
      [24, 26], [26, 28], [28, 30], [28, 32],
    ];

    ctx.beginPath();
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        const x1 = landmarks[start].x * canvas.width;
        const y1 = landmarks[start].y * canvas.height;
        const x2 = landmarks[end].x * canvas.width;
        const y2 = landmarks[end].y * canvas.height;

        if (landmarks[start].visibility > 0.5 && landmarks[end].visibility > 0.5) {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
      }
    });
    ctx.stroke();

    const keyPoints = [11, 12, 13, 14, 23, 24, 25, 26, 27, 28];
    ctx.fillStyle = '#00ff00';
    keyPoints.forEach(idx => {
      if (landmarks[idx] && landmarks[idx].visibility > 0.5) {
        const x = landmarks[idx].x * canvas.width;
        const y = landmarks[idx].y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.fillStyle = '#ff0000';
    [25, 26].forEach(idx => {
      if (landmarks[idx] && landmarks[idx].visibility > 0.5) {
        const x = landmarks[idx].x * canvas.width;
        const y = landmarks[idx].y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  // ============ CÁMARA ============
  const startCamera = async () => {
    try {
      console.log('📷 Solicitando acceso a cámara...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperar a que el video esté listo
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
        
        console.log('✅ Cámara iniciada correctamente');
      }
      setCameraError('');
    } catch (err) {
      console.error('❌ Error accediendo a la cámara:', err);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log('📷 Cámara detenida');
    }
  };

  // ============ ENVÍO DE FRAMES ============
  const sendFrames = (ws) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) {
      console.error('❌ Canvas o video no disponible');
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    let frameCount = 0;

    // Limpiar intervalo anterior si existe
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
    }

    sendIntervalRef.current = setInterval(() => {
        console.log('🔄 Intervalo ejecutándose...');
  console.log('isActiveRef.current:', isActiveRef.current);
  console.log('ws.readyState:', ws?.readyState);
      // Usar REF en lugar de estado
      if (!isActiveRef.current || !ws || ws.readyState !== WebSocket.OPEN) {
        console.log('⏹️ Deteniendo envío de frames');
        clearInterval(sendIntervalRef.current);
        sendIntervalRef.current = null;
        return;
      }

      frameCount++;
      
      if (frameCount % 30 === 0) {
        console.log(`📤 Frame #${frameCount} enviado`);
      }

      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameData = canvas.toDataURL('image/jpeg', 0.7);

        ws.send(JSON.stringify({
          type: 'frame',
          frame: frameData,
          session_id: sessionId,
          serie_id: serieId
        }));
      } catch (err) {
        console.error('❌ Error enviando frame:', err);
      }
    }, 100);

    console.log('✅ Envío de frames iniciado');
  };

  // ============ SESIÓN ============
  const startSession = async () => {
    setIsLoading(true);
    try {
      console.log('🟢 Iniciando sesión...');
      const token = localStorage.getItem('token');

      const res = await fetch('/api/analysis/session/start', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      setSessionId(data.session_id);
      console.log(`✅ Sesión creada: ${data.session_id}`);

      await startSerie();

      const rawUser = localStorage.getItem('user');
      let user = null;
      try { user = rawUser ? JSON.parse(rawUser) : null; } catch { user = null; }

      const userId = user?.id ?? user?._id ?? user?.userId ?? user?.uid ?? user?.UsuarioId ?? user?.usuario_id;

      if (!userId) {
        alert('No se encontró el ID de usuario');
        setIsLoading(false);
        return;
      }

      const wsUrl = `ws://${window.location.hostname}:8000/analysis/ws/${userId}`;
      console.log(`🔌 Conectando WebSocket a: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = async () => {
        console.log('✅ WebSocket conectado');
        
        // IMPORTANTE: Activar ANTES de iniciar cámara
        isActiveRef.current = true;
        setIsActive(true);
        
        await startCamera();
        
        // Pequeño delay para asegurar que el video esté listo
        setTimeout(() => {
          sendFrames(ws);
        }, 500);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'analysis' && msg.data) {
            setReps(msg.data.reps ?? 0);
            setState(msg.data.state ?? 'UP');
            setFeedback(msg.data.feedback ?? []);
            setErrors(msg.data.errors ?? []);
            setMetrics(msg.data.metrics ?? {});
            
            if (msg.data.landmarks && msg.data.landmarks.length > 0) {
              drawSkeleton(msg.data.landmarks);
            }
          }
        } catch (err) {
          console.error('❌ Error parseando mensaje WS:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔴 WebSocket cerrado');
        isActiveRef.current = false;
        setIsActive(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('❌ Error completo:', err);
      alert(`Error al iniciar entrenamiento: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = async () => {
    console.log('🛑 Deteniendo sesión...');
    
    // Desactivar PRIMERO
    isActiveRef.current = false;
    setIsActive(false);

    // Detener envío de frames
    if (sendIntervalRef.current) {
      clearInterval(sendIntervalRef.current);
      sendIntervalRef.current = null;
    }

    // Cerrar WS
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }

    // Detener cámara
    stopCamera();

    // Limpiar canvas
    const canvas = overlayCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Finalizar serie
    if (serieId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/analysis/serie/${serieId}/end`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Serie finalizada');
      } catch (err) {
        console.error('❌ Error al finalizar serie:', err);
      }
    }

    // Finalizar sesión
    if (sessionId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/analysis/session/${sessionId}/end`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Sesión finalizada:', data);
          alert(`✅ Sesión finalizada!\n\n` +
                `📊 Total repeticiones: ${data.total_repeticiones}\n` +
                `✅ Correctas: ${data.correctas}\n` +
                `❌ Incorrectas: ${data.incorrectas}\n` +
                `⏱️ Duración: ${data.duracion_minutos} min\n` +
                `🎯 Score promedio: ${data.score_promedio}%`);
        }
      } catch (err) {
        console.error('❌ Error al finalizar sesión:', err);
      }
    }

    // Reset
    setSessionId(null);
    setSerieId(null);
    setReps(0);
    setFeedback([]);
    setErrors([]);
    setMetrics({});
    setState('UP');
  };

  // ============ SERIE ============
  const startSerie = async () => {
    try {
      console.log('🟢 Iniciando serie...');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analysis/serie/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Error al iniciar serie');

      const data = await res.json();
      setSerieId(data.serie_id);
      setReps(0);
      console.log(`✅ Serie creada: ${data.serie_id}`);
    } catch (err) {
      console.error('❌ Error startSerie:', err);
    }
  };

  // ============ CLEANUP ============
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (sendIntervalRef.current) {
        clearInterval(sendIntervalRef.current);
      }
      stopCamera();
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, []);

  // ============ UI ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎥 Análisis de Sentadillas</h1>
          <p className="text-gray-400">Entrena con feedback en tiempo real</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              
              <div className="relative bg-black aspect-video flex items-center justify-center">
                {cameraError ? (
                  <div className="text-center p-8">
                    <p className="text-red-400 mb-4">❌ {cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                    
                    {isActive && (
                      <>
                        <div className="absolute top-4 right-4 bg-black/70 px-6 py-3 rounded-lg">
                          <p className="text-sm text-gray-400">Repeticiones</p>
                          <p className="text-4xl font-bold text-teal-400">{reps}</p>
                        </div>
                        
                        <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                          <p className={`text-lg font-bold ${state === 'DOWN' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {state === 'DOWN' ? '⬇️ ABAJO' : '⬆️ ARRIBA'}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-700">
                {!isActive ? (
                  <button
                    onClick={startSession}
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition font-semibold text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '⏳ Iniciando...' : '▶️ Iniciar Entrenamiento'}
                  </button>
                ) : (
                  <button
                    onClick={stopSession}
                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold text-lg"
                  >
                    ⏹️ Detener Entrenamiento
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Errores</h3>
                <div className="space-y-2">
                  {errors.map((msg, idx) => (
                    <div key={idx} className="p-3 rounded-lg text-sm bg-red-900/30 text-red-200">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💬 Feedback</h3>
              
              {feedback.length > 0 ? (
                <div className="space-y-2">
                  {feedback.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-sm ${
                        msg.includes('✅') 
                          ? 'bg-green-900/30 text-green-300 border border-green-800' 
                          : 'bg-blue-900/30 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {isActive ? 'Esperando análisis...' : 'Inicia el entrenamiento para ver feedback'}
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Métricas</h3>
              
              {Object.keys(metrics).length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Ángulo de rodilla</p>
                    <p className="text-2xl font-bold text-white">{metrics.knee_angle?.toFixed(1) || '---'}°</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400">Inclinación tronco</p>
                    <p className="text-2xl font-bold text-white">{metrics.trunk_lean?.toFixed(1) || '---'}°</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400">Profundidad</p>
                    <p className="text-2xl font-bold text-white">
                      {((metrics.depth_relative || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">Valgo rodilla L/R</p>
                    <p className="text-sm text-gray-300">
                      {metrics.knee_valgus_L?.toFixed(1) || '0.0'} / {metrics.knee_valgus_R?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Sin datos</p>
              )}
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <Footer/>
    </div>
  );
}