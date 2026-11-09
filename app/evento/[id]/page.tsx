"use client";

import { useEffect, useState, use } from "react";
import { ShoppingCart, ArrowLeft, X, Check, Download, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AlbumDeEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [evento, setEvento] = useState<any>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<any>(null);
  const [comprada, setComprada] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      const { data: dataEvento } = await supabase
        .from("eventos")
        .select("*")
        .eq("id", id)
        .single();

      const { data: dataFotos } = await supabase
        .from("fotos")
        .select("*")
        .eq("evento_id", id);

      setEvento(dataEvento);
      setFotos(dataFotos || []);
      setCargando(false);
    }

    cargarDatos();
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Cargando galería...</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
        <Link href="/" className="text-gray-400 hover:text-white underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans select-none">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#222]">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight">{evento.titulo}</h1>
            <p className="text-xs text-gray-400">{evento.fecha} • Fotos de {evento.fotografo}</p>
          </div>
        </div>
        <button className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors">
          <ShoppingCart size={20} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {fotos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Aún no hay fotos subidas para este evento.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto) => (
              <div 
                key={foto.id} 
                onClick={() => { setFotoSeleccionada(foto); setComprada(false); }}
                className="group relative aspect-[4/3] bg-[#111] rounded-xl overflow-hidden border border-[#222] hover:border-white transition-all cursor-pointer"
              >
                <img 
                  src={foto.url} 
                  alt="Foto de evento" 
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                />
                
                {/* MARCA DE AGUA EN GRILLA PARA LA MINIATURA */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-30 bg-[repeating-linear-gradient(-45deg,transparent,transparent_20px,rgba(255,255,255,0.15)_20px,rgba(255,255,255,0.15)_40px)]" />
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-30">
                  <span className="text-white font-black text-2xl -rotate-12 tracking-widest select-none">
                    CAPTOME
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 z-20">
                  <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                    ${foto.precio || "150"} MXN
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL CON PROTECCIÓN AVANZADA */}
      {fotoSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-[#111] border border-[#333] rounded-2xl overflow-hidden flex flex-col md:flex-row">
            
            <button 
              onClick={() => setFotoSeleccionada(null)}
              className="absolute top-4 right-4 z-30 bg-black/70 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            {/* ÁREA DE IMAGEN CON MARCA DE AGUA MULTICAPA Y BLOQUEOS */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-4 min-h-[250px] max-h-[55vh] md:max-h-[90vh] overflow-hidden select-none">
              <img 
                src={fotoSeleccionada.url} 
                alt="Vista previa protegida"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
              
              {!comprada && (
                <>
                  {/* Capa 1: Rayado de seguridad */}
                  <div className="absolute inset-0 z-10 pointer-events-none opacity-25 bg-[repeating-linear-gradient(-45deg,transparent,transparent_25px,rgba(255,255,255,0.2)_25px,rgba(255,255,255,0.2)_50px)]" />
                  
                  {/* Capa 2: Malla repetida de texto CAPTOME */}
                  <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-around items-center opacity-35 select-none overflow-hidden -rotate-12">
                    <div className="text-white font-black text-xl md:text-3xl tracking-[0.3em] flex gap-12 whitespace-nowrap">
                      <span>CAPTOME</span><span>CAPTOME</span><span>CAPTOME</span>
                    </div>
                    <div className="text-white font-black text-xl md:text-3xl tracking-[0.3em] flex gap-12 whitespace-nowrap">
                      <span>CAPTOME</span><span>CAPTOME</span><span>CAPTOME</span>
                    </div>
                    <div className="text-white font-black text-xl md:text-3xl tracking-[0.3em] flex gap-12 whitespace-nowrap">
                      <span>CAPTOME</span><span>CAPTOME</span><span>CAPTOME</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PANEL LATERAL DE COMPRA */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#222] bg-[#111] shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
                  <ShieldAlert size={14} /> Vista previa protegida
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Foto Digital HD</h3>
                <p className="text-sm text-gray-400 mb-6">Descarga inmediata limpia y en máxima calidad al realizar tu pago.</p>
                
                <div className="text-3xl font-extrabold text-white mb-6">
                  ${fotoSeleccionada.precio || "150"} <span className="text-sm text-gray-400 font-normal">MXN</span>
                </div>
              </div>

              <div>
                {!comprada ? (
                  <button 
                    onClick={() => setComprada(true)}
                    className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Simular Compra
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                      <Check size={18} /> ¡Foto adquirida!
                    </div>
                    <a 
                      href={fotoSeleccionada.url} 
                      target="_blank" 
                      download 
                      className="w-full bg-green-500 text-black font-bold py-3 px-4 rounded-xl hover:bg-green-400 transition-colors flex items-center justify-center gap-2 text-center"
                    >
                      <Download size={18} /> Descargar en HD
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}