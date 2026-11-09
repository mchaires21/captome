'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: string;
  nombre?: string;
  titulo?: string;
  fecha?: string;
  lugar?: string;
  fotografo?: string;
  portada_url?: string;
}

export default function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerEventos() {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error al cargar eventos:', error);
        } else if (data) {
          setEventos(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setCargando(false);
      }
    }

    obtenerEventos();
  }, []);

  const eventosFiltrados = eventos.filter((e) => {
    const termino = busqueda.toLowerCase();
    const titulo = (e.nombre || e.titulo || '').toLowerCase();
    const fotografo = (e.fotografo || '').toLowerCase();
    const lugar = (e.lugar || '').toLowerCase();
    return titulo.includes(termino) || fotografo.includes(termino) || lugar.includes(termino);
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navegación Principal */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-wider text-white hover:opacity-80">
            captome
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
              Explorar
            </Link>
            <Link href="#precios" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Precios
            </Link>
            <Link 
              href="/subir" 
              className="bg-white text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              + Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      {/* Catálogo de Eventos */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Catálogo</span>
          <h1 className="text-4xl font-extrabold mt-1 mb-2">Todos los eventos</h1>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Buscá tu carrera, filtrá por disciplina o zona, y encontrá el álbum donde están tus fotos.
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Evento, ciudad o fotógrafo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        {/* Grid de Tarjetas de Evento */}
        {cargando ? (
          <div className="py-20 text-center text-neutral-500">Cargando eventos...</div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="py-20 text-center text-neutral-500">No se encontraron eventos.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento) => (
              <div 
                key={evento.id} 
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                {/* Visual / Portada */}
                <div className="relative aspect-video bg-neutral-800 flex items-center justify-center overflow-hidden">
                  {evento.portada_url ? (
                    <img 
                      src={evento.portada_url} 
                      alt={evento.nombre || evento.titulo} 
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <div className="inset-0 flex items-center justify-center opacity-20 font-black text-3xl tracking-widest pointer-events-none">
                      CAPTOME
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Contenido e información */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-1">
                      {evento.nombre || evento.titulo || 'Evento Deportivo'}
                    </h3>
                    <p className="text-xs text-neutral-400 mb-4">
                      {evento.fecha || 'Reciente'} {evento.lugar ? `• ${evento.lugar}` : ''}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between mt-auto">
                    {/* Botón Ver álbum cliqueable */}
                    <Link
                      href={`/evento/${evento.id}`}
                      className="text-green-400 font-bold text-sm hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Ver álbum &rarr;
                    </Link>

                    {evento.fotografo && (
                      <span className="text-xs text-neutral-500 truncate max-w-[150px]">
                        Fotos de {evento.fotografo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}