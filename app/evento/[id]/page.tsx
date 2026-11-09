'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: string | number;
  nombre?: string;
  titulo?: string;
  fecha?: string;
  lugar?: string;
  fotografo?: string;
}

interface Foto {
  id: string | number;
  url: string;
  dorsal?: string;
  fotografo?: string;
  precio?: number;
}

export default function EventoDetalle() {
  const params = useParams();
  const eventoId = params?.id as string;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [busquedaDorsal, setBusquedaDorsal] = useState('');
  const [cargando, setCargando] = useState(true);

  // Modal y Pago
  const [fotoSeleccionada, setFotoSeleccionada] = useState<Foto | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [fotoCompradaId, setFotoCompradaId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      if (query.get('pago') === 'exito') {
        setPagoExitoso(true);
        const fotoUrlParam = query.get('foto');
        if (fotoUrlParam) {
          setFotoCompradaId(String(fotoUrlParam));
        }
      }
    }

    if (!eventoId) return;

    async function cargarDatos() {
      try {
        const { data: eventoData } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', eventoId)
          .single();

        if (eventoData) setEvento(eventoData);

        const { data: fotosData, error: fotosError } = await supabase
          .from('fotos')
          .select('*')
          .eq('evento_id', eventoId)
          .order('created_at', { ascending: false });

        if (fotosError) {
          console.error('Error cargando fotos:', fotosError);
        } else if (fotosData) {
          setFotos(fotosData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [eventoId]);

  const fotosFiltradas = fotos.filter((foto) => {
    if (!busquedaDorsal.trim()) return true;
    if (!foto.dorsal) return false;
    return foto.dorsal.toString().toLowerCase().includes(busquedaDorsal.trim().toLowerCase());
  });

  const iniciarPago = async (foto: Foto) => {
    setProcesandoPago(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoId: String(foto.id),
          eventoId,
          precio: foto.precio || 150,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      alert('Ocurrió un error al conectar con la pasarela de pagos.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const descargarFoto = async (url: string, nombreArchivo: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nombreArchivo || 'foto-captome.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white select-none">
      {/* Navegación */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-wider text-white hover:opacity-80">
            captome
          </Link>
          <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-white">
            ← Volver al catálogo
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {pagoExitoso && (
          <div className="mb-6 p-4 bg-green-950 border border-green-800 text-green-300 rounded-xl text-center font-semibold">
            🎉 ¡Pago completado con éxito! Tu fotografía sin marca de agua se ha desbloqueado.
          </div>
        )}

        {/* Encabezado del Evento */}
        <div className="mb-8 border-b border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Galería de Evento</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-1">
            {evento?.nombre || evento?.titulo || 'Evento Deportivo'}
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            {evento?.fecha || 'Reciente'} {evento?.lugar ? `• ${evento.lugar}` : ''}
          </p>
        </div>

        {/* Buscador por Dorsal */}
        <div className="mb-10 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-xl">
          <label className="block text-sm font-bold text-neutral-200 mb-2">
            🔍 Buscar por tu Número de Dorsal
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ejemplo: 412, 1089"
              value={busquedaDorsal}
              onChange={(e) => setBusquedaDorsal(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-base text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            {busquedaDorsal && (
              <button
                type="button"
                onClick={() => setBusquedaDorsal('')}
                className="bg-neutral-800 hover:bg-neutral-700 text-xs px-4 py-3 rounded-xl font-semibold transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Grid de Fotografías */}
        {cargando ? (
          <div className="py-20 text-center text-neutral-500">Cargando fotografías...</div>
        ) : fotosFiltradas.length === 0 ? (
          <div className="py-20 text-center text-neutral-500 bg-neutral-950 border border-neutral-800 rounded-2xl">
            {busquedaDorsal ? (
              <p className="text-base">No se encontraron fotos con el dorsal <span className="text-white font-bold">&quot;{busquedaDorsal}&quot;</span>.</p>
            ) : (
              <p className="text-base">Aún no hay fotos registradas para este evento.</p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-neutral-400 font-medium">
                Mostrando {fotosFiltradas.length} foto(s)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {fotosFiltradas.map((foto) => {
                const esComprada = Boolean(fotoCompradaId) && String(foto.id) === String(fotoCompradaId);
                return (
                  <div
                    key={foto.id}
                    onClick={() => setFotoSeleccionada(foto)}
                    className="group relative bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col cursor-pointer"
                  >
                    {/* Contenedor Cuadrado con Imagen Centrada (sin recortar) */}
                    <div className="w-full aspect-square relative bg-neutral-950 flex items-center justify-center p-2">
                      <img
                        src={foto.url}
                        alt={foto.dorsal ? `Dorsal ${foto.dorsal}` : 'Foto de evento'}
                        className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-102 transition-transform duration-300"
                      />
                      
                      {/* Marca de Agua Superpuesta */}
                      {!esComprada && (
                        <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center overflow-hidden">
                          <div className="rotate-[-25deg] text-white/30 text-lg font-black tracking-widest uppercase select-none whitespace-nowrap border-2 border-white/20 px-3 py-1 rounded">
                            CAPTOME • MUESTRA
                          </div>
                        </div>
                      )}

                      {esComprada && (
                        <span className="absolute top-3 right-3 z-10 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                          ✓ Adquirida
                        </span>
                      )}

                      {foto.dorsal && (
                        <span className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-md border border-neutral-700">
                          #{foto.dorsal}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex items-center justify-between mt-auto bg-neutral-900 border-t border-neutral-800/60 z-10">
                      <span className="text-xs text-neutral-400 truncate">
                        {foto.fotografo ? `Por ${foto.fotografo}` : 'Foto Oficial'}
                      </span>
                      {esComprada ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            descargarFoto(foto.url, `foto-${foto.id}.jpg`);
                          }}
                          className="bg-green-500 text-black hover:bg-green-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Descargar HD
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFotoSeleccionada(foto);
                          }}
                          className="bg-white text-black hover:bg-neutral-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalle y Pago */}
      {fotoSeleccionada && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-1/2 min-h-[300px] bg-black relative flex items-center justify-center p-4">
              <img
                src={fotoSeleccionada.url}
                alt="Vista previa"
                className="max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded-lg"
              />
              {String(fotoSeleccionada.id) !== String(fotoCompradaId) && (
                <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center overflow-hidden">
                  <div className="rotate-[-25deg] text-white/35 text-xl font-black tracking-widest uppercase select-none border-2 border-white/25 px-4 py-1.5 rounded-lg">
                    CAPTOME • MUESTRA
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 md:w-1/2 flex flex-col justify-between bg-neutral-900">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {String(fotoSeleccionada.id) === String(fotoCompradaId) ? 'Fotografía Adquirida' : 'Fotografía HD'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFotoSeleccionada(null)}
                    className="text-neutral-400 hover:text-white font-bold text-base p-1"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {String(fotoSeleccionada.id) === String(fotoCompradaId) ? '¡Tu Foto está Lista!' : 'Comprar Foto Digital'}
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  {String(fotoSeleccionada.id) === String(fotoCompradaId)
                    ? 'Puedes descargar la imagen original en alta resolución sin marca de agua.'
                    : 'Incluye descarga instantánea en alta resolución sin marca de agua y licencia de uso personal.'}
                </p>
                <div className="text-2xl font-black text-green-400 mb-6">
                  {String(fotoSeleccionada.id) === String(fotoCompradaId) ? '¡Comprada!' : `$${fotoSeleccionada.precio || 150} MXN`}
                </div>
              </div>

              <div className="space-y-3">
                {String(fotoSeleccionada.id) === String(fotoCompradaId) ? (
                  <button
                    type="button"
                    onClick={() => descargarFoto(fotoSeleccionada.url, `foto-${fotoSeleccionada.id}.jpg`)}
                    className="w-full bg-green-500 text-black font-bold py-3 px-4 rounded-xl hover:bg-green-400 transition-colors cursor-pointer text-sm"
                  >
                    Descargar Original HD
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => iniciarPago(fotoSeleccionada)}
                    disabled={procesandoPago}
                    className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer text-sm"
                  >
                    {procesandoPago ? 'Procesando...' : 'Pagar con Tarjeta / Mercado Pago'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFotoSeleccionada(null)}
                  className="w-full block text-center bg-neutral-800 text-neutral-300 font-semibold py-2.5 px-4 rounded-xl hover:bg-neutral-700 text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}