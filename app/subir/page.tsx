'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: string | number;
  nombre?: string;
  titulo?: string;
}

export default function SubirFotos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [dorsal, setDorsal] = useState('');
  const [fotografo, setFotografo] = useState('');
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    async function cargarEventos() {
      try {
        const { data, error } = await supabase.from('eventos').select('*');
        if (error) {
          console.error('Error cargando eventos:', error);
          setMensaje({ tipo: 'error', texto: `Error en BD (eventos): ${error.message}` });
        } else if (data && data.length > 0) {
          setEventos(data);
          setEventoSeleccionado(String(data[0].id));
        } else {
          setMensaje({ tipo: 'error', texto: 'No hay eventos creados en la base de datos.' });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al conectar con eventos.';
        setMensaje({ tipo: 'error', texto: msg });
      } finally {
        setCargandoEventos(false);
      }
    }
    cargarEventos();
  }, []);

  const handleSubida = async (e: FormEvent) => {
    e.preventDefault();
    if (!archivos || archivos.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Selecciona al menos una foto.' });
      return;
    }

    if (!eventoSeleccionado) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un evento de la lista.' });
      return;
    }

    const LIMITE_MB = 10;
    const LIMITE_BYTES = LIMITE_MB * 1024 * 1024;

    for (let i = 0; i < archivos.length; i++) {
      if (archivos[i].size > LIMITE_BYTES) {
        setMensaje({
          tipo: 'error',
          texto: `La foto "${archivos[i].name}" supera el límite de ${LIMITE_MB} MB.`,
        });
        return;
      }
    }

    setSubiendo(true);
    setMensaje(null);

    let subidasExitosas = 0;
    let errorDetallado = '';

    try {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const extension = archivo.name.split('.').pop() || 'jpg';
        const nombreArchivo = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;
        const rutaArchivo = `${eventoSeleccionado}/${nombreArchivo}`;

        // 1. Subida a Storage
        const { error: uploadError } = await supabase.storage
          .from('fotos-bucket')
          .upload(rutaArchivo, archivo, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error Storage:', uploadError);
          errorDetallado = `Error Storage: ${uploadError.message}`;
          continue;
        }

        // 2. Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('fotos-bucket')
          .getPublicUrl(rutaArchivo);

        const urlPublica = urlData.publicUrl;

        // 3. Insertar en tabla fotos
        const { error: dbError } = await supabase.from('fotos').insert([
          {
            evento_id: eventoSeleccionado,
            url: urlPublica,
            dorsal: dorsal ? dorsal.trim() : null,
            fotografo: fotografo ? fotografo.trim() : null,
          },
        ]);

        if (dbError) {
          console.error('Error DB:', dbError);
          errorDetallado = `Error Tabla fotos: ${dbError.message}`;
        } else {
          subidasExitosas++;
        }
      }

      if (subidasExitosas > 0) {
        setMensaje({
          tipo: 'exito',
          texto: `¡Se subieron ${subidasExitosas} foto(s) correctamente!`,
        });
        setArchivos(null);
        setDorsal('');
      } else {
        setMensaje({
          tipo: 'error',
          texto: errorDetallado || 'No se pudo subir la foto. Revisa la consola o configuración de Supabase.',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setMensaje({ tipo: 'error', texto: msg });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Panel Fotógrafo</span>
          <h1 className="text-3xl font-extrabold mt-1">Cargar Fotografías</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Sube las imágenes directamente desde tu dispositivo (Máx. 10 MB por foto).
          </p>
        </div>

        {mensaje && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-semibold break-words ${
              mensaje.tipo === 'exito'
                ? 'bg-green-950 text-green-300 border border-green-800'
                : 'bg-red-950 text-red-300 border border-red-800'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubida} className="space-y-6 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">Seleccionar Evento</label>
            <select
              value={eventoSeleccionado}
              onChange={(e) => setEventoSeleccionado(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600 appearance-none cursor-pointer"
              required
            >
              {cargandoEventos ? (
                <option value="" className="bg-neutral-900 text-white">Cargando eventos...</option>
              ) : eventos.length === 0 ? (
                <option value="" className="bg-neutral-900 text-white">No hay eventos disponibles</option>
              ) : (
                eventos.map((ev) => (
                  <option key={ev.id} value={String(ev.id)} className="bg-neutral-900 text-white">
                    {ev.nombre || ev.titulo || `Evento ID: ${ev.id}`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">Fotos (JPG, PNG - Máx. 10 MB cada una)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setArchivos(e.target.files)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200 cursor-pointer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-1">Dorsal / Número de Corredor (Opcional)</label>
            <span className="text-xs text-neutral-500 block mb-2">Ejemplo: 412, 1089</span>
            <input
              type="text"
              placeholder="Número de corredor"
              value={dorsal}
              onChange={(e) => setDorsal(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">Nombre del Fotógrafo (Opcional)</label>
            <input
              type="text"
              placeholder="Tu nombre o estudio"
              value={fotografo}
              onChange={(e) => setFotografo(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <button
            type="submit"
            disabled={subiendo || cargandoEventos || eventos.length === 0}
            className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {subiendo ? 'Subiendo fotos a Supabase...' : 'Subir fotos'}
          </button>
        </form>
      </main>
    </div>
  );
}